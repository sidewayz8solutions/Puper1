/**
 * Google Places Autocomplete Service for Puper
 * Provides intelligent location search with autocomplete suggestions
 */

export class PlacesAutocompleteService {
  constructor() {
    this.placesService = null;
    this.autocompleteService = null;
    this.sessionToken = null;
    this.initializeService();
  }

  initializeService() {
    if (window.google && window.google.maps && window.google.maps.places) {
      this.placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      this.autocompleteService = new window.google.maps.places.AutocompleteService();
      this.generateNewSessionToken();
    } else {
      console.warn('Google Maps Places API not loaded yet');
    }
  }

  /**
   * Generate a new session token for billing optimization
   */
  generateNewSessionToken() {
    if (window.google && window.google.maps && window.google.maps.places) {
      this.sessionToken = new window.google.maps.places.AutocompleteSessionToken();
    }
  }

  /**
   * Get autocomplete predictions for a query
   * @param {string} input - Search query
   * @param {Object} options - Autocomplete options
   * @returns {Promise} Autocomplete predictions
   */
  async getAutocompletePredictions(input, options = {}) {
    if (!this.autocompleteService) {
      this.initializeService();
      if (!this.autocompleteService) {
        throw new Error('Google Places Autocomplete service not available');
      }
    }

    if (!input || input.length < 2) {
      return [];
    }

    const request = {
      input: input,
      sessionToken: this.sessionToken,
      ...this.buildAutocompleteOptions(options)
    };

    return new Promise((resolve, reject) => {
      this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const processedPredictions = predictions.map(this.processPrediction);
          resolve(processedPredictions);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(new Error(`Autocomplete request failed: ${status}`));
        }
      });
    });
  }

  /**
   * Get detailed place information by place ID
   * @param {string} placeId - Google Places place ID
   * @param {Array} fields - Fields to retrieve
   * @returns {Promise} Detailed place information
   */
  async getPlaceDetails(placeId, fields = null) {
    if (!this.placesService) {
      this.initializeService();
      if (!this.placesService) {
        throw new Error('Google Places service not available');
      }
    }

    const request = {
      placeId: placeId,
      fields: fields || this.getDefaultPlaceFields(),
      sessionToken: this.sessionToken
    };

    return new Promise((resolve, reject) => {
      this.placesService.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const processedPlace = this.processPlaceDetails(place);
          // Generate new session token after using the current one
          this.generateNewSessionToken();
          resolve(processedPlace);
        } else {
          reject(new Error(`Place details request failed: ${status}`));
        }
      });
    });
  }

  /**
   * Search for places near a location
   * @param {Object} location - { lat, lng }
   * @param {Object} options - Search options
   * @returns {Promise} Nearby places
   */
  async searchNearbyPlaces(location, options = {}) {
    if (!this.placesService) {
      this.initializeService();
      if (!this.placesService) {
        throw new Error('Google Places service not available');
      }
    }

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: options.radius || 5000,
      type: options.type || 'establishment',
      keyword: options.keyword || '',
      ...options
    };

    return new Promise((resolve, reject) => {
      this.placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const processedResults = results.map(this.processPlaceDetails);
          resolve(processedResults);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else {
          reject(new Error(`Nearby search failed: ${status}`));
        }
      });
    });
  }

  /**
   * Build autocomplete options from parameters
   * @param {Object} options - User-provided options
   * @returns {Object} Google Maps autocomplete options
   */
  buildAutocompleteOptions(options) {
    const autocompleteOptions = {};

    // Location bias (prefer results near this location)
    if (options.locationBias) {
      if (options.locationBias.center && options.locationBias.radius) {
        autocompleteOptions.locationBias = {
          center: new window.google.maps.LatLng(
            options.locationBias.center.lat,
            options.locationBias.center.lng
          ),
          radius: options.locationBias.radius
        };
      }
    }

    // Location restriction (only return results in this area)
    if (options.locationRestriction) {
      if (options.locationRestriction.bounds) {
        const bounds = options.locationRestriction.bounds;
        autocompleteOptions.locationRestriction = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(bounds.south, bounds.west),
          new window.google.maps.LatLng(bounds.north, bounds.east)
        );
      }
    }

    // Country restrictions
    if (options.countries && options.countries.length > 0) {
      autocompleteOptions.componentRestrictions = {
        country: options.countries
      };
    }

    // Types filter
    if (options.types && options.types.length > 0) {
      autocompleteOptions.types = options.types;
    }

    return autocompleteOptions;
  }

  /**
   * Process autocomplete prediction
   * @param {Object} prediction - Raw Google prediction
   * @returns {Object} Processed prediction
   */
  processPrediction(prediction) {
    return {
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || '',
      secondaryText: prediction.structured_formatting?.secondary_text || '',
      types: prediction.types || [],
      matchedSubstrings: prediction.matched_substrings || [],
      terms: prediction.terms || [],
      distanceMeters: prediction.distance_meters || null
    };
  }

  /**
   * Process detailed place information
   * @param {Object} place - Raw Google place object
   * @returns {Object} Processed place details
   */
  processPlaceDetails(place) {
    return {
      placeId: place.place_id,
      name: place.name,
      formattedAddress: place.formatted_address,
      location: place.geometry ? {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      } : null,
      viewport: place.geometry?.viewport ? {
        northeast: {
          lat: place.geometry.viewport.getNorthEast().lat(),
          lng: place.geometry.viewport.getNorthEast().lng()
        },
        southwest: {
          lat: place.geometry.viewport.getSouthWest().lat(),
          lng: place.geometry.viewport.getSouthWest().lng()
        }
      } : null,
      types: place.types || [],
      rating: place.rating || null,
      priceLevel: place.price_level || null,
      openingHours: place.opening_hours ? {
        isOpen: place.opening_hours.isOpen(),
        periods: place.opening_hours.periods || [],
        weekdayText: place.opening_hours.weekday_text || []
      } : null,
      photos: place.photos ? place.photos.map(photo => ({
        url: photo.getUrl({ maxWidth: 400, maxHeight: 400 }),
        attributions: photo.html_attributions
      })) : [],
      website: place.website || null,
      phoneNumber: place.formatted_phone_number || null,
      internationalPhoneNumber: place.international_phone_number || null,
      utcOffset: place.utc_offset_minutes || null,
      addressComponents: place.address_components || [],
      reviews: place.reviews || []
    };
  }

  /**
   * Get default place fields for details requests
   * @returns {Array} Default fields
   */
  getDefaultPlaceFields() {
    return [
      'place_id',
      'name',
      'formatted_address',
      'geometry',
      'types',
      'rating',
      'price_level',
      'opening_hours',
      'photos',
      'website',
      'formatted_phone_number',
      'international_phone_number',
      'utc_offset_minutes',
      'address_components',
      'reviews'
    ];
  }

  /**
   * Get autocomplete suggestions for restroom-related searches
   * @param {string} input - Search query
   * @param {Object} location - User location for bias
   * @returns {Promise} Restroom-related suggestions
   */
  async getRestroomSuggestions(input, location = null) {
    const options = {
      types: ['establishment', 'point_of_interest'],
      locationBias: location ? {
        center: location,
        radius: 10000 // 10km radius
      } : null
    };

    // Add restroom-related keywords to the search
    const restroomKeywords = ['restroom', 'bathroom', 'toilet', 'washroom', 'lavatory'];
    const enhancedInput = restroomKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    ) ? input : `${input} restroom`;

    return this.getAutocompletePredictions(enhancedInput, options);
  }

  /**
   * Find places that likely have restrooms
   * @param {Object} location - Search center
   * @param {number} radius - Search radius in meters
   * @returns {Promise} Places with likely restroom access
   */
  async findPlacesWithRestrooms(location, radius = 2000) {
    const placeTypes = [
      'gas_station',
      'restaurant',
      'shopping_mall',
      'hospital',
      'library',
      'park',
      'subway_station',
      'train_station',
      'airport'
    ];

    const searchPromises = placeTypes.map(type =>
      this.searchNearbyPlaces(location, { type, radius })
    );

    try {
      const results = await Promise.all(searchPromises);
      const allPlaces = results.flat();
      
      // Remove duplicates and sort by rating
      const uniquePlaces = allPlaces.filter((place, index, self) =>
        index === self.findIndex(p => p.placeId === place.placeId)
      );

      return uniquePlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } catch (error) {
      console.error('Error finding places with restrooms:', error);
      return [];
    }
  }
}

// Create singleton instance
export const placesAutocompleteService = new PlacesAutocompleteService();

export default placesAutocompleteService;
