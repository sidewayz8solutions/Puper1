import { googlePlacesService } from './googleMaps';
import { restroomService } from './supabase';

// Initialize Google Places service
let placesInitialized = false;

const initializePlaces = async () => {
  if (!placesInitialized) {
    try {
      await googlePlacesService.initialize();
      placesInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Places:', error);
    }
  }
};

export const getNearbyRestrooms = async (lat, lon, filters = {}) => {
  try {
    await initializePlaces();

    // Get restrooms from Google Places
    const googleRestrooms = await googlePlacesService.findNearbyRestrooms(
      lat,
      lon,
      filters.radius || 5000
    );

    // Also get user-added restrooms from Supabase
    let userRestrooms = [];
    try {
      userRestrooms = await restroomService.getNearby(lat, lon, filters.radius || 5000);
    } catch (error) {
      console.warn('Failed to fetch user restrooms:', error);
    }

    // Combine and deduplicate
    const allRestrooms = [...googleRestrooms, ...userRestrooms];

    // Sort by distance
    return allRestrooms.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  } catch (error) {
    console.error('Error fetching nearby restrooms:', error);
    // Fallback to user restrooms only
    try {
      return await restroomService.getNearby(lat, lon, filters.radius || 5000);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
};

export const getRestroom = async (id) => {
  // Try Google Places first
  try {
    await initializePlaces();
    return await googlePlacesService.getPlaceDetails(id);
  } catch (error) {
    // Fallback to Supabase
    return await restroomService.getById(id);
  }
};

export const createRestroom = async (data) => {
  // User-added restrooms go to Supabase
  return await restroomService.create(data);
};

export const searchRestrooms = async (query, lat, lon, filters = {}) => {
  try {
    await initializePlaces();

    // Search Google Places
    const googleResults = await googlePlacesService.searchRestrooms(
      query,
      lat,
      lon,
      filters.radius || 10000
    );

    // Search user restrooms
    let userResults = [];
    try {
      userResults = await restroomService.search(query, lat, lon, filters);
    } catch (error) {
      console.warn('Failed to search user restrooms:', error);
    }

    // Combine and sort
    const allResults = [...googleResults, ...userResults];
    return allResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  } catch (error) {
    console.error('Error searching restrooms:', error);
    // Fallback to user search only
    try {
      return await restroomService.search(query, lat, lon, filters);
    } catch (fallbackError) {
      return [];
    }
  }
};

// Search for establishments by address
export const searchEstablishmentsByAddress = async (address, searchQuery = '') => {
  try {
    await initializePlaces();

    const result = await googlePlacesService.searchEstablishmentsByAddress(address, searchQuery);
    return result;
  } catch (error) {
    console.error('Error searching establishments by address:', error);
    throw error;
  }
};

// Search for restrooms at a specific establishment
export const searchRestroomsAtEstablishment = async (establishmentName, address) => {
  try {
    await initializePlaces();

    const restrooms = await googlePlacesService.searchRestroomsAtEstablishment(establishmentName, address);
    return restrooms;
  } catch (error) {
    console.error('Error searching restrooms at establishment:', error);
    throw error;
  }
};

// Combined address search - finds establishments and their restrooms
export const searchAddressForRestrooms = async (address, establishmentQuery = '') => {
  try {
    await initializePlaces();

    // First, find establishments at the address
    const establishmentResult = await googlePlacesService.searchEstablishmentsByAddress(address, establishmentQuery);

    // For each establishment, try to find restroom information
    const establishmentsWithRestrooms = await Promise.all(
      establishmentResult.establishments.map(async (establishment) => {
        try {
          const restrooms = await googlePlacesService.searchRestroomsAtEstablishment(
            establishment.name,
            establishment.address
          );
          return {
            ...establishment,
            restrooms: restrooms,
            hasRestrooms: restrooms.length > 0
          };
        } catch (error) {
          console.warn(`Failed to find restrooms for ${establishment.name}:`, error);
          return {
            ...establishment,
            restrooms: [],
            hasRestrooms: false
          };
        }
      })
    );

    return {
      searchLocation: establishmentResult.searchLocation,
      establishments: establishmentsWithRestrooms,
      totalEstablishments: establishmentsWithRestrooms.length,
      establishmentsWithRestrooms: establishmentsWithRestrooms.filter(e => e.hasRestrooms).length
    };
  } catch (error) {
    console.error('Error searching address for restrooms:', error);
    throw error;
  }
};

export const addReview = async (restroomId, reviewData) => {
  return await restroomService.addReview(restroomId, reviewData);
};

export const reportRestroom = async (id, data) => {
  return await restroomService.addReview(id, {
    ...data,
    rating: 1,
    comment: `REPORT: ${data.reason}`,
    is_report: true
  });
};
