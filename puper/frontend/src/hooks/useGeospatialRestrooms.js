import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

/**
 * Advanced geospatial hook for finding restrooms using PostGIS
 * Based on the comprehensive geospatial guide provided
 */
export const useGeospatialRestrooms = () => {
  const [restrooms, setRestrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Find nearby restrooms using PostGIS ST_DWithin
  const findNearbyRestrooms = useCallback(async (lat, lon, radiusMeters = 5000) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Finding restrooms within ${radiusMeters}m of (${lat}, ${lon})`);
      
      const { data, error: rpcError } = await supabase.rpc('find_nearby_restrooms', {
        user_lat: lat,
        user_lon: lon,
        radius_meters: radiusMeters
      });

      if (rpcError) {
        throw new Error(`PostGIS query failed: ${rpcError.message}`);
      }

      console.log(`Found ${data?.length || 0} nearby restrooms`);
      setRestrooms(data || []);
      return data || [];
      
    } catch (err) {
      console.error('Error finding nearby restrooms:', err);
      setError(err.message);
      
      // Fallback to basic lat/lon filtering if PostGIS fails
      return await findNearbyFallback(lat, lon, radiusMeters);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fallback method using basic lat/lon bounding box
  const findNearbyFallback = useCallback(async (lat, lon, radiusMeters) => {
    try {
      console.log('Using fallback method for nearby restrooms');
      
      // Convert meters to approximate degrees (rough calculation)
      const radiusDegrees = radiusMeters / 111000;
      
      const { data, error } = await supabase
        .from('restrooms')
        .select(`
          *,
          reviews (
            id,
            rating,
            comment,
            created_at
          )
        `)
        .gte('lat', lat - radiusDegrees)
        .lte('lat', lat + radiusDegrees)
        .gte('lon', lon - radiusDegrees)
        .lte('lon', lon + radiusDegrees)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate distance manually and add review stats
      const processedData = data.map(restroom => {
        const distance = calculateHaversineDistance(lat, lon, restroom.lat, restroom.lon);
        return {
          ...restroom,
          distance_meters: distance,
          avg_rating: restroom.reviews.length > 0 
            ? restroom.reviews.reduce((sum, review) => sum + review.rating, 0) / restroom.reviews.length
            : 0,
          review_count: restroom.reviews.length
        };
      }).filter(restroom => restroom.distance_meters <= radiusMeters)
        .sort((a, b) => a.distance_meters - b.distance_meters);

      setRestrooms(processedData);
      return processedData;
      
    } catch (err) {
      console.error('Fallback method also failed:', err);
      setError(err.message);
      return [];
    }
  }, []);

  // Search restrooms with text and location
  const searchRestrooms = useCallback(async (searchQuery, lat, lon, radiusMeters = 10000) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('search_restrooms', {
        search_query: searchQuery,
        user_lat: lat,
        user_lon: lon,
        radius_meters: radiusMeters
      });

      if (rpcError) throw rpcError;

      setRestrooms(data || []);
      return data || [];
      
    } catch (err) {
      console.error('Error searching restrooms:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get restrooms within map bounds (for efficient map loading)
  const getRestroomsInBounds = useCallback(async (bounds) => {
    setLoading(true);
    setError(null);
    
    try {
      const { north, south, east, west } = bounds;
      
      const { data, error: rpcError } = await supabase.rpc('get_restrooms_in_bounds', {
        north_lat: north,
        south_lat: south,
        east_lon: east,
        west_lon: west
      });

      if (rpcError) throw rpcError;

      setRestrooms(data || []);
      return data || [];
      
    } catch (err) {
      console.error('Error getting restrooms in bounds:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Find closest restrooms (using PostGIS nearest neighbor)
  const findClosestRestrooms = useCallback(async (lat, lon, limit = 5) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('find_closest_restrooms', {
        lat: lat,
        lon: lon,
        limit_count: limit
      });

      if (rpcError) throw rpcError;

      setRestrooms(data || []);
      return data || [];
      
    } catch (err) {
      console.error('Error finding closest restrooms:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new restroom with automatic geometry calculation
  const addRestroom = useCallback(async (restroomData) => {
    try {
      const { data, error } = await supabase
        .from('restrooms')
        .insert([{
          ...restroomData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Restroom added successfully:', data);
      return data;
      
    } catch (err) {
      console.error('Error adding restroom:', err);
      throw err;
    }
  }, []);

  return {
    restrooms,
    loading,
    error,
    findNearbyRestrooms,
    searchRestrooms,
    getRestroomsInBounds,
    findClosestRestrooms,
    addRestroom,
    clearError: () => setError(null)
  };
};

// Haversine distance calculation for fallback
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 1000); // Return distance in meters
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default useGeospatialRestrooms;
