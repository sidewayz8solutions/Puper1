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

  // Get all restrooms globally (paginated) with aggregates; optionally compute distance relative to user location
  async getAllRestrooms(userLat = null, userLon = null, batchSize = 1000, maxPages = 50) {
    try {
      const all = [];
      let from = 0;
      for (let page = 0; page < maxPages; page++) {
        const to = from + batchSize - 1;
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
            reviews (
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
          .range(from, to);
        if (error) throw error;
        if (!data || data.length === 0) break;

        const base = (data || []).map((restroom) => {
          const reviews = restroom.reviews || [];
          const reviewCount = reviews.length;
          const avgRating = reviewCount > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
            : 0;
          const obj = {
            ...restroom,
            latitude: restroom.lat,
            longitude: restroom.lon || restroom.lng,
            review_count: reviewCount,
            avg_rating: avgRating,
          };
          if (
            userLat != null &&
            userLon != null &&
            restroom.lat != null &&
            restroom.lon != null
          ) {
            obj.distance = this.calculateDistance(
              userLat,
              userLon,
              restroom.lat,
              restroom.lon
            );
          }
          return obj;
        });

        all.push(...base);
        if (data.length < batchSize) break;
        from += batchSize;
      }
      return all;
    } catch (error) {
      console.error('Error fetching all restrooms:', error);
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
            stocked_rating,
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

  // Update restroom accessibility flags (crowd-sourced from ratings)
  async updateAccessibilityFlags(restroomId, flags) {
    try {
      const updateData = {};
      if (typeof flags.wheelchair_accessible === 'boolean') {
        updateData.wheelchair_accessible = flags.wheelchair_accessible;
      }
      if (typeof flags.baby_changing === 'boolean') {
        updateData.baby_changing = flags.baby_changing;
      }
      if (Object.keys(updateData).length === 0) return null;

      const { data, error } = await supabase
        .from('restrooms')
        .update(updateData)
        .eq('id', restroomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating accessibility flags:', error);
      throw error;
    }
  },

  // Subscribe to real-time review inserts for given restroom IDs
  subscribeToReviews(restroomIds, onInsert) {
    if (!Array.isArray(restroomIds) || restroomIds.length === 0) {
      console.warn('[Supabase] subscribeToReviews called with empty restroomIds');
      return { unsubscribe: () => {} };
    }
    // Deduplicate IDs and build filter list
    const uniqueIds = [...new Set(restroomIds)].filter(Boolean);
    const channel = supabase
      .channel('reviews-inserts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews'
        },
        payload => {
          try {
            const newRow = payload?.new;
            if (!newRow || !uniqueIds.includes(newRow.restroom_id)) return;
            onInsert && onInsert(newRow);
          } catch (err) {
            console.warn('[Supabase] review subscription handler error', err?.message || err);
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase] Review subscription active');
        }
      });
    return {
      unsubscribe: () => {
        try { supabase.removeChannel(channel); } catch {}
      }
    };
  },

  // Subscribe to real-time restroom inserts (global map updates)
  subscribeToRestrooms(onInsert) {
    const channel = supabase
      .channel('restrooms-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'restrooms' },
        (payload) => {
          try {
            const newRow = payload?.new;
            if (!newRow) return;
            onInsert && onInsert(newRow);
          } catch (err) {
            console.warn('[Supabase] restrooms subscription handler error', err?.message || err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase] Restroom insert subscription active');
        }
      });
    return {
      unsubscribe: () => {
        try { supabase.removeChannel(channel); } catch {}
      }
    };
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

  // Calculate average rating from reviews (return precise average)
  calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    const avg = sum / reviews.length;
    return Number.isFinite(avg) ? avg : 0;
  }
};

// Photo upload service
export const photoService = {
  // Upload review photo to Supabase Storage (React Native compatible)
  async uploadReviewPhoto(photoUri, identifier, photoIndex) {
    try {
      console.log('[PhotoService] Starting upload for photo:', photoIndex, 'URI:', photoUri);

      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = photoUri.split('.').pop().split('?')[0] || 'jpg';
      const fileName = `review-${identifier}-${photoIndex}-${timestamp}.${fileExt}`;

      console.log('[PhotoService] Uploading file:', fileName);

      // For React Native, we need to read the file and convert to base64
      // Then decode it for upload
      let response;
      try {
        response = await fetch(photoUri);
      } catch (fetchError) {
        console.error('[PhotoService] Fetch error:', fetchError.message);
        throw new Error(`Failed to fetch image: ${fetchError.message}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('[PhotoService] File size:', uint8Array.length, 'bytes');

      if (uint8Array.length === 0) {
        throw new Error('Image file is empty');
      }

      // Upload to Supabase Storage using Uint8Array
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(fileName, uint8Array, {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('[PhotoService] Upload error:', uploadError.message, JSON.stringify(uploadError));
        throw uploadError;
      }

      console.log('[PhotoService] Upload successful:', uploadData);

      // Get public URL
      const { data } = supabase.storage
        .from('review-photos')
        .getPublicUrl(fileName);

      console.log('[PhotoService] Public URL:', data.publicUrl);
      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('[PhotoService] Error uploading review photo:', error.message || error);
      return { url: null, error: error.message || 'Upload failed' };
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
  },

  // Test if storage bucket is accessible
  async testBucketAccess() {
    try {
      console.log('[PhotoService] Testing bucket access...');
      const { error } = await supabase.storage
        .from('review-photos')
        .list('', { limit: 1 });

      if (error) {
        console.error('[PhotoService] Bucket access test failed:', error.message);
        return { accessible: false, error: error.message };
      }

      console.log('[PhotoService] Bucket access test successful');
      return { accessible: true, error: null };
    } catch (error) {
      console.error('[PhotoService] Bucket access test error:', error.message);
      return { accessible: false, error: error.message };
    }
  }
};

// ---- IAP / receipt validation via Supabase Edge Functions ----

export async function verifyIosReceiptWithSupabase(receiptData, userId) {
  if (!receiptData) {
    throw new Error('Missing receiptData');
  }

  const { data, error } = await supabase.functions.invoke('verify_ios_receipt', {
    body: { receiptData, userId },
  });

  if (error) {
    console.warn('[Supabase] verify_ios_receipt error', error);
    throw error;
  }

  return data;
}

export async function verifyAndroidReceiptWithSupabase(purchaseToken, productId, packageName) {
  if (!purchaseToken) {
    throw new Error('Missing purchaseToken');
  }
  const resolvedPackage = packageName || extras?.androidPackage || Constants?.expoConfig?.android?.package;
  const { data, error } = await supabase.functions.invoke('verify_android_receipt', {
    body: {
      purchaseToken,
      productId,
      packageName: resolvedPackage,
    },
  });

  if (error) {
    console.warn('[Supabase] verify_android_receipt error', error);
    throw error;
  }

  return data;
}

export default supabase;

