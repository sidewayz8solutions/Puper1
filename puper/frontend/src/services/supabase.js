import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Restroom operations
export const restroomService = {
  // Get nearby restrooms using PostGIS
  async getNearby(lat, lon, radius = 5000) {
    try {
      const { data, error } = await supabase.rpc('find_nearby_restrooms', {
        user_lat: lat,
        user_lon: lon,
        radius_meters: radius
      });

      if (error) throw error;

      return data.map(restroom => ({
        ...restroom,
        // Normalize to lng for frontend
        lng: restroom.lng ?? restroom.lon,
        distance: restroom.distance_meters // Already calculated by PostGIS
      }));
    } catch (error) {
      console.error('Error fetching nearby restrooms:', error);
      // Fallback to basic query if PostGIS function fails
      return await this.getNearbyFallback(lat, lon, radius);
    }
  },

  // Fallback method using basic lat/lon filtering
  async getNearbyFallback(lat, lon, radius = 5000) {
    try {
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
        .gte('lat', lat - (radius / 111000)) // Rough conversion to degrees
        .lte('lat', lat + (radius / 111000))
        .gte('lon', lon - (radius / 111000))
        .lte('lon', lon + (radius / 111000))
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate average ratings and distance
      return data.map(restroom => ({
        ...restroom,
        lng: restroom.lng ?? restroom.lon,
        avg_rating: restroom.reviews.length > 0
          ? restroom.reviews.reduce((sum, review) => sum + review.rating, 0) / restroom.reviews.length
          : 0,
        review_count: restroom.reviews.length,
        distance: calculateDistance(lat, lon, restroom.lat, restroom.lon)
      }));
    } catch (error) {
      console.error('Error in fallback nearby restrooms:', error);
      throw error;
    }
  },

  // Create new restroom
  async create(restroomData) {
    try {
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to add a restroom');
      }

      const payload = { ...restroomData };
      // Normalize lng -> lon for DB schema
      if (payload.lng !== undefined && payload.lon === undefined) {
        payload.lon = payload.lng;
        delete payload.lng;
      }
      payload.created_at = new Date().toISOString();
      payload.user_id = user.id; // Add user ID to track who added the restroom

      const { data, error } = await supabase
        .from('restrooms')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating restroom:', error);
      throw error;
    }
  },

  // Get single restroom
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('restrooms')
        .select(`
          *,
          reviews (
            id,
            rating,
            comment,
            created_at,
            user_id,
            users (
              id,
              username
            )
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

  // Add review
  async addReview(restroomId, reviewData) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          restroom_id: restroomId,
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

  // Search restrooms using PostGIS full-text search
  async search(query, lat, lon, filters = {}) {
    try {
      // Use PostGIS search function if coordinates are provided
      if (lat && lon) {
        const { data, error } = await supabase.rpc('search_restrooms', {
          search_query: query,
          user_lat: lat,
          user_lon: lon,
          radius_meters: filters.radius || 10000
        });

        if (error) throw error;

        return data.map(restroom => ({
          ...restroom,
          distance: restroom.distance_meters
        }));
      }

      // Fallback to basic search without location
      let queryBuilder = supabase
        .from('restrooms')
        .select(`
          *,
          reviews (
            id,
            rating
          )
        `)
;

      // Text search
      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Location filters
      if (lat && lon) {
        const radius = filters.radius || 10000;
        queryBuilder = queryBuilder
          .gte('lat', lat - (radius / 111000))
          .lte('lat', lat + (radius / 111000))
          .gte('lon', lon - (radius / 111000))
          .lte('lon', lon + (radius / 111000));
      }

      // Feature filters
      if (filters.wheelchair_accessible) {
        queryBuilder = queryBuilder.eq('wheelchair_accessible', true);
      }
      if (filters.baby_changing) {
        queryBuilder = queryBuilder.eq('baby_changing', true);
      }
      if (filters.gender_neutral) {
        queryBuilder = queryBuilder.eq('gender_neutral', true);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(restroom => ({
        ...restroom,
        lng: restroom.lng ?? restroom.lon,
        avg_rating: restroom.reviews.length > 0
          ? restroom.reviews.reduce((sum, review) => sum + review.rating, 0) / restroom.reviews.length
          : 0,
        review_count: restroom.reviews.length,
        distance: lat && lon ? calculateDistance(lat, lon, restroom.lat, restroom.lon) : null
      }));
    } catch (error) {
      console.error('Error searching restrooms:', error);
      throw error;
    }
  },

  // Get restrooms within map bounds (for efficient map loading)
  async getInBounds(bounds) {
    try {
      const { north, south, east, west } = bounds;

      const { data, error } = await supabase.rpc('get_restrooms_in_bounds', {
        north_lat: north,
        south_lat: south,
        east_lon: east,
        west_lon: west
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching restrooms in bounds:', error);
      throw error;
    }
  },

  // Create new restroom with automatic geometry calculation
  async createWithLocation(restroomData) {
    try {
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to add a restroom');
      }

      // Normalize lng -> lon if needed; DB trigger will set geometry
      const payload = { ...restroomData };
      if (payload.lng !== undefined && payload.lon === undefined) {
        payload.lon = payload.lng;
        delete payload.lng;
      }
      payload.created_at = new Date().toISOString();
      payload.user_id = user.id; // Add user ID to track who added the restroom

      const { data, error } = await supabase
        .from('restrooms')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating restroom with location:', error);
      throw error;
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

export default supabase;
