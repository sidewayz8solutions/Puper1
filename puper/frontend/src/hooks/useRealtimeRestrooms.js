import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

/**
 * State-of-the-art realtime geospatial hook for restrooms
 * Features: Realtime updates, optimistic UI, caching, error recovery
 */
export const useRealtimeRestrooms = () => {
  const [restrooms, setRestrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Cache and subscription management
  const subscriptionRef = useRef(null);
  const cacheRef = useRef(new Map());
  const lastFetchRef = useRef(null);

  // Optimistic updates queue
  const [optimisticUpdates, setOptimisticUpdates] = useState([]);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (subscriptionRef.current || isSubscribed) return;

    console.log('🔄 Setting up realtime subscription for restrooms');

    const subscription = supabase
      .channel('restrooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restrooms'
        },
        (payload) => {
          console.log('🔄 Realtime restroom update:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          console.log('🔄 Realtime review update:', payload);
          handleReviewUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = subscription;
  }, [isSubscribed]);

  // Handle realtime restroom updates
  const handleRealtimeUpdate = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setRestrooms(currentRestrooms => {
      switch (eventType) {
        case 'INSERT':
          // Check if restroom already exists (avoid duplicates)
          if (currentRestrooms.find(r => r.id === newRecord.id)) {
            return currentRestrooms;
          }
          console.log('➕ New restroom added:', newRecord.name);
          return [...currentRestrooms, { ...newRecord, avg_rating: 0, review_count: 0 }];

        case 'UPDATE':
          console.log('✏️ Restroom updated:', newRecord.name);
          return currentRestrooms.map(restroom =>
            restroom.id === newRecord.id
              ? { ...restroom, ...newRecord }
              : restroom
          );

        case 'DELETE':
          console.log('🗑️ Restroom deleted:', oldRecord.id);
          return currentRestrooms.filter(restroom => restroom.id !== oldRecord.id);

        default:
          return currentRestrooms;
      }
    });
  }, []);

  // Handle realtime review updates
  const handleReviewUpdate = useCallback((payload) => {
    const { eventType, new: newReview, old: oldReview } = payload;

    setRestrooms(currentRestrooms => {
      return currentRestrooms.map(restroom => {
        const reviewRestroomId = newReview?.restroom_id || oldReview?.restroom_id;
        
        if (restroom.id !== reviewRestroomId) return restroom;

        // Recalculate ratings for affected restroom
        let updatedRestroom = { ...restroom };

        switch (eventType) {
          case 'INSERT':
            console.log('⭐ New review added for:', restroom.name);
            updatedRestroom.review_count = (restroom.review_count || 0) + 1;
            // Approximate new average (would need to refetch for exact)
            const currentTotal = (restroom.avg_rating || 0) * (restroom.review_count || 0);
            updatedRestroom.avg_rating = (currentTotal + newReview.rating) / updatedRestroom.review_count;
            break;

          case 'DELETE':
            console.log('🗑️ Review deleted for:', restroom.name);
            updatedRestroom.review_count = Math.max((restroom.review_count || 1) - 1, 0);
            // Would need to refetch for exact average
            break;
        }

        return updatedRestroom;
      });
    });
  }, []);

  // Optimistic UI: Add restroom immediately, sync later
  const addRestroomOptimistic = useCallback(async (restroomData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticRestroom = {
      ...restroomData,
      id: tempId,
      avg_rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // Add to UI immediately
    setRestrooms(current => [optimisticRestroom, ...current]);
    setOptimisticUpdates(current => [...current, tempId]);

    try {
      // Sync with database
      const { data, error } = await supabase
        .from('restrooms')
        .insert([restroomData])
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic with real data
      setRestrooms(current =>
        current.map(r => r.id === tempId ? { ...data, avg_rating: 0, review_count: 0 } : r)
      );
      setOptimisticUpdates(current => current.filter(id => id !== tempId));

      console.log('✅ Restroom synced successfully:', data.name);
      return data;

    } catch (err) {
      console.error('❌ Failed to sync restroom:', err);
      
      // Remove optimistic update on failure
      setRestrooms(current => current.filter(r => r.id !== tempId));
      setOptimisticUpdates(current => current.filter(id => id !== tempId));
      
      throw err;
    }
  }, []);

  // Enhanced nearby search with caching
  const findNearbyRestrooms = useCallback(async (lat, lon, radiusMeters = 5000) => {
    const cacheKey = `${lat.toFixed(4)}-${lon.toFixed(4)}-${radiusMeters}`;
    const cached = cacheRef.current.get(cacheKey);
    
    // Return cached data if recent (5 minutes)
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      console.log('📦 Using cached restroom data');
      setRestrooms(cached.data);
      return cached.data;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('find_nearby_restrooms', {
        user_lat: lat,
        user_lon: lon,
        radius_meters: radiusMeters
      });

      if (rpcError) throw rpcError;

      // Cache the results
      cacheRef.current.set(cacheKey, {
        data: data || [],
        timestamp: Date.now()
      });

      setRestrooms(data || []);
      lastFetchRef.current = { lat, lon, radiusMeters };

      // Setup realtime subscription after first fetch
      if (!isSubscribed) {
        setupRealtimeSubscription();
      }

      return data || [];

    } catch (err) {
      console.error('Error finding nearby restrooms:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isSubscribed, setupRealtimeSubscription]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log('🔌 Cleaning up realtime subscription');
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
        setIsSubscribed(false);
      }
    };
  }, []);

  // Auto-refresh data periodically
  useEffect(() => {
    if (!lastFetchRef.current) return;

    const interval = setInterval(() => {
      const { lat, lon, radiusMeters } = lastFetchRef.current;
      console.log('🔄 Auto-refreshing restroom data');
      findNearbyRestrooms(lat, lon, radiusMeters);
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    return () => clearInterval(interval);
  }, [findNearbyRestrooms]);

  return {
    restrooms,
    loading,
    error,
    isSubscribed,
    optimisticUpdates,
    findNearbyRestrooms,
    addRestroomOptimistic,
    clearError: () => setError(null),
    refreshData: () => {
      if (lastFetchRef.current) {
        const { lat, lon, radiusMeters } = lastFetchRef.current;
        return findNearbyRestrooms(lat, lon, radiusMeters);
      }
    }
  };
};

export default useRealtimeRestrooms;
