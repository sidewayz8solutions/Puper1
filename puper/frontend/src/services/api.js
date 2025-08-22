// API service layer for Püper
// This provides a clean interface for all backend communications

import { supabase } from './supabase';
import { googlePlacesService } from './googleMaps';

// Base API configuration
const API_CONFIG = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  timeout: 10000, // 10 seconds
  retries: 3
};

// Generic API error handler
class APIError extends Error {
  constructor(message, status, source) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.source = source;
  }
}

// Retry wrapper for API calls
const withRetry = async (fn, retries = API_CONFIG.retries) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Main API service
export const apiService = {
  // Health check for all services
  async healthCheck() {
    const results = {
      supabase: { status: 'unknown', message: '', timestamp: new Date().toISOString() },
      googleMaps: { status: 'unknown', message: '', timestamp: new Date().toISOString() }
    };

    // Test Supabase
    try {
      const { data, error } = await supabase
        .from('restrooms')
        .select('id')
        .limit(1);

      if (error) throw error;

      results.supabase = {
        status: 'healthy',
        message: 'Supabase connection successful',
        timestamp: new Date().toISOString(),
        recordCount: data?.length || 0
      };
    } catch (error) {
      results.supabase = {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }

    // Test Google Maps
    try {
      await googlePlacesService.initialize();
      results.googleMaps = {
        status: 'healthy',
        message: 'Google Maps API loaded successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      results.googleMaps = {
        status: 'error',
        message: error.message || 'Google Maps API failed to load',
        timestamp: new Date().toISOString()
      };
    }

    return results;
  },

  // Restroom operations
  restrooms: {
    // Get all restrooms (with optional filtering)
    async getAll(filters = {}) {
      try {
        return await withRetry(async () => {
          let query = supabase
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
            `);

          // Apply filters
          if (filters.limit) query = query.limit(filters.limit);
          if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

          const { data, error } = await query.order('created_at', { ascending: false });

          if (error) throw new APIError(error.message, error.code, 'supabase');

          // Process data
          return data.map(restroom => ({
            ...restroom,
            avg_rating: restroom.reviews.length > 0
              ? restroom.reviews.reduce((sum, review) => sum + review.rating, 0) / restroom.reviews.length
              : 0,
            review_count: restroom.reviews.length
          }));
        });
      } catch (error) {
        console.error('Failed to fetch all restrooms:', error);
        throw error;
      }
    },

    // Get nearby restrooms
    async getNearby(lat, lon, radius = 5000) {
      try {
        return await withRetry(async () => {
          const radiusInDegrees = radius / 111000; // Convert meters to degrees (rough)

          const { data, error } = await supabase
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
            .gte('lat', lat - radiusInDegrees)
            .lte('lat', lat + radiusInDegrees)
            .gte('lon', lon - radiusInDegrees)
            .lte('lon', lon + radiusInDegrees)
            .order('created_at', { ascending: false });

          if (error) throw new APIError(error.message, error.code, 'supabase');

          // Calculate distance and process data
          return data.map(restroom => {
            const distance = calculateDistance(lat, lon, restroom.lat, restroom.lon);
            return {
              ...restroom,
              avg_rating: restroom.reviews.length > 0
                ? restroom.reviews.reduce((sum, review) => sum + review.rating, 0) / restroom.reviews.length
                : 0,
              review_count: restroom.reviews.length,
              distance
            };
          }).filter(restroom => restroom.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
        });
      } catch (error) {
        console.error('Failed to fetch nearby restrooms:', error);
        throw error;
      }
    }
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
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

export default apiService;
