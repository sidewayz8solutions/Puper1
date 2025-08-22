import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { getNearbyRestrooms } from '../services/restrooms';
import { supabase } from '../services/supabase';

// Enhanced hook with direct Supabase fallback
export const useRestrooms = (lat, lon, filters = {}) => {
  const [fallbackData, setFallbackData] = useState([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // Primary data fetching with React Query (Google Places + Supabase)
  const { data, isLoading, error, refetch } = useQuery(
    ['restrooms', lat, lon, filters],
    () => getNearbyRestrooms(lat, lon, filters),
    {
      enabled: !!lat && !!lon,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      onError: (error) => {
        console.warn('Primary restroom fetch failed, trying direct Supabase:', error);
      }
    }
  );

  // Direct Supabase fallback when primary method fails
  useEffect(() => {
    const fetchDirectFromSupabase = async () => {
      if (error && lat && lon && !isLoading) {
        setFallbackLoading(true);
        try {
          console.log('Fetching restrooms directly from Supabase...');
          const { data: supabaseData, error: supabaseError } = await supabase
            .from('restrooms')
            .select(`
              *,
              reviews (
                id,
                rating,
                comment,
                created_at,
                user_id
              )
            `)
            .gte('lat', lat - 0.045) // ~5km radius
            .lte('lat', lat + 0.045)
            .gte('lon', lon - 0.045)
            .lte('lon', lon + 0.045)
            .order('created_at', { ascending: false });

          if (supabaseError) {
            throw supabaseError;
          }

          // Process the data similar to the service
          const processedData = supabaseData.map(restroom => ({
            ...restroom,
            avg_rating: restroom.reviews.length > 0
              ? restroom.reviews.reduce((sum, review) => sum + review.rating, 0) / restroom.reviews.length
              : 0,
            review_count: restroom.reviews.length,
            distance: calculateDistance(lat, lon, restroom.lat, restroom.lon),
            source: 'supabase_direct'
          }));

          setFallbackData(processedData);
          console.log(`Loaded ${processedData.length} restrooms from Supabase directly`);
        } catch (fallbackError) {
          console.error('Direct Supabase fetch also failed:', fallbackError);
          setFallbackData([]);
        } finally {
          setFallbackLoading(false);
        }
      }
    };

    fetchDirectFromSupabase();
  }, [error, lat, lon, isLoading]);

  // Helper function for distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return Math.round(d * 1000); // Return in meters
  };

  const deg2rad = (deg) => deg * (Math.PI/180);

  // Return the best available data
  const finalData = data || fallbackData;
  const finalLoading = isLoading || fallbackLoading;

  return {
    restrooms: finalData || [],
    loading: finalLoading,
    error: error && fallbackData.length === 0 ? error : null,
    refetch,
    source: data ? 'combined' : fallbackData.length > 0 ? 'supabase_direct' : 'none'
  };
};
