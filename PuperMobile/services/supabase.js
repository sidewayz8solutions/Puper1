import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Read config from Expo extras for secure configuration
const extras = Constants?.expoConfig?.extra || {};
const supabaseUrl = extras.supabaseUrl;
const supabaseAnonKey = extras.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing configuration in app.json extra field');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Restroom service for mobile app
export const restroomService = {
  // Get nearby restrooms using PostGIS
  async getNearby(lat, lon, radius = 5000) {
    try {
      const { data, error } = await supabase.rpc('find_nearby_restrooms', {
        user_lat: lat,
        user_lon: lon,
        radius_meters: radius
      });

      if (error) {
        console.warn('RPC error, using fallback:', error);
        return this.getNearbyFallback(lat, lon, radius);
      }

      // Normalize coordinate names for mobile compatibility
      const base = (data || []).map(restroom => ({
        ...restroom,
        latitude: restroom.lat,
        longitude: restroom.lon || restroom.lng,
        distance: restroom.distance_meters || restroom.distance,
        review_count: 0,
        avg_rating: 0
      }));

      // Fetch global aggregates (avg + count) for these restrooms
      const ids = base.map(r => r.id).filter(Boolean);
      if (ids.length > 0) {
        const { data: aggRows, error: aggError } = await supabase
          .from('reviews')
          .select('restroom_id, rating')
          .in('restroom_id', ids);
        if (!aggError && aggRows) {
          const grouped = aggRows.reduce((acc, row) => {
            if (!acc[row.restroom_id]) acc[row.restroom_id] = { sum: 0, count: 0 };
            acc[row.restroom_id].sum += (row.rating || 0);
            acc[row.restroom_id].count += 1;
            return acc;
          }, {});
          for (const r of base) {
            const g = grouped[r.id];
            if (g) {
              r.review_count = g.count;
              r.avg_rating = g.count > 0 ? g.sum / g.count : 0;
            }
          }
        }
      }
      return base;
    } catch (error) {
      console.error('Error fetching nearby restrooms:', error);
      return this.getNearbyFallback(lat, lon, radius);
    }
  },

  // Fallback method without PostGIS
  async getNearbyFallback(lat, lon, radius = 5000) {
    try {
      const radiusDegrees = radius / 111000; // Rough conversion

      const { data, error } = await supabase
        .from('restrooms')
        .select(`
          id,
          name,
          description,
          lat,
          lon,
          wheelchair_accessible,
          baby_changing,
          gender_neutral,
          created_at,
          reviews(
            id,
            rating,
            cleanliness_rating,
            stocked_rating,
            comment,
            review_text,
            photos,
            created_at
          )
        `)
        .gte('lat', lat - radiusDegrees)
        .lte('lat', lat + radiusDegrees)
        .gte('lon', lon - radiusDegrees)
        .lte('lon', lon + radiusDegrees)
        .limit(100);

      if (error) throw error;

      // Calculate distances and sort, normalize coordinate names
      const restroomsWithDistance = (data || []).map(restroom => {
        const distance = this.calculateDistance(
          lat,
          lon,
          restroom.lat,
          restroom.lon
        );
        return { 
          ...restroom, 
          distance,
          // Add normalized coordinate names for mobile compatibility
          latitude: restroom.lat,
          longitude: restroom.lon,
          review_count: restroom.reviews ? restroom.reviews.length : 0,
          avg_rating: restroom.reviews && restroom.reviews.length > 0
            ? restroom.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / restroom.reviews.length
            : 0
        };
      });

      return restroomsWithDistance
        .filter(r => r.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Fallback error:', error);
      return [];
    }
  },

  // Get restroom by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('restrooms')
        .select(`
          *,
          reviews (
            id,
            rating,
            cleanliness_rating,
            stock_rating,
            comment,
            review_text,
            photos,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching restroom:', error);
      throw error;
    }
  },

  // Create new restroom
  async create(restroomData) {
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
      return data;
    } catch (error) {
      console.error('Error creating restroom:', error);
      throw error;
    }
  },

  // Add review
  async addReview(reviewData) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          ...reviewData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  // Format distance for display
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  },

  // Calculate average rating from reviews
  calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round(sum / reviews.length);
  }
};

// Photo upload service
export const photoService = {
  // Upload review photo to Supabase Storage
  async uploadReviewPhoto(photoUri, identifier, photoIndex) {
    try {
      // Convert local URI to blob for upload
      const response = await fetch(photoUri);
      const blob = await response.blob();
      
      // Generate unique filename using identifier (restroom ID + timestamp)
      const timestamp = Date.now();
      const fileExt = photoUri.split('.').pop().split('?')[0] || 'jpg';
      const fileName = `review-${identifier}-${photoIndex}-${timestamp}.${fileExt}`;
      const filePath = `review-photos/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('review-photos')
        .getPublicUrl(filePath);
      
      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading review photo:', error);
      return { url: null, error: error.message };
    }
  },
  
  // Upload multiple photos for a review
  async uploadReviewPhotos(photoUris, reviewId) {
    try {
      const uploadPromises = photoUris.map((uri, index) => 
        this.uploadReviewPhoto(uri, reviewId, index)
      );
      
      const results = await Promise.all(uploadPromises);
      
      // Extract URLs from successful uploads
      const photoUrls = results
        .filter(result => result.url && !result.error)
        .map(result => result.url);
      
      // Check if any uploads failed
      const failedUploads = results.filter(result => result.error);
      if (failedUploads.length > 0) {
        console.warn('Some photos failed to upload:', failedUploads);
      }
      
      return { urls: photoUrls, errors: failedUploads };
    } catch (error) {
      console.error('Error uploading review photos:', error);
      return { urls: [], errors: [error] };
    }
  },
  
  // Delete photo from Supabase Storage (optional cleanup function)
  async deleteReviewPhoto(photoUrl) {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/review-photos/');
      if (urlParts.length < 2) {
        throw new Error('Invalid photo URL format');
      }
      
      const filePath = urlParts[1].split('?')[0]; // Remove query params
      
      const { error } = await supabase.storage
        .from('review-photos')
        .remove([`review-photos/${filePath}`]);
      
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting review photo:', error);
      return { success: false, error: error.message };
    }
  }
};

export default supabase;

