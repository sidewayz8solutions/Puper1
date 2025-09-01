/**
 * Google Maps Geocoding Service for Puper
 * Converts addresses to coordinates and coordinates to addresses
 */

export class GeocodingService {
  constructor() {
    this.geocoder = null;
    this.initializeService();
  }

  initializeService() {
    if (window.google && window.google.maps) {
      this.geocoder = new window.google.maps.Geocoder();
    } else {
      console.warn('Google Maps not loaded yet');
    }
  }

  /**
   * Convert address to coordinates (Forward Geocoding)
   * @param {string} address - Address to geocode
   * @param {Object} options - Additional options
   * @returns {Promise} Geocoding results
   */
  async geocodeAddress(address, options = {}) {
    if (!this.geocoder) {
      this.initializeService();
      if (!this.geocoder) {
        throw new Error('Google Maps Geocoding service not available');
      }
    }

    const request = {
      address: address,
      ...options
    };

    return new Promise((resolve, reject) => {
      this.geocoder.geocode(request, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const location = {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            address: result.formatted_address,
            placeId: result.place_id,
            types: result.types,
            addressComponents: result.address_components,
            geometry: result.geometry,
            fullResult: result
          };
          resolve(location);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  /**
   * Convert coordinates to address (Reverse Geocoding)
   * @param {Object} location - { lat, lng }
   * @param {Object} options - Additional options
   * @returns {Promise} Reverse geocoding results
   */
  async reverseGeocode(location, options = {}) {
    if (!this.geocoder) {
      this.initializeService();
      if (!this.geocoder) {
        throw new Error('Google Maps Geocoding service not available');
      }
    }

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      ...options
    };

    return new Promise((resolve, reject) => {
      this.geocoder.geocode(request, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const addressInfo = {
            address: result.formatted_address,
            lat: location.lat,
            lng: location.lng,
            placeId: result.place_id,
            types: result.types,
            addressComponents: result.address_components,
            geometry: result.geometry,
            fullResult: result
          };
          resolve(addressInfo);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  /**
   * Search for places near a location
   * @param {string} query - Search query
   * @param {Object} location - { lat, lng }
   * @param {number} radius - Search radius in meters
   * @returns {Promise} Search results
   */
  async searchNearby(query, location, radius = 5000) {
    try {
      // Use geocoding with location bias
      const results = await this.geocodeAddress(query, {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: radius
      });
      return results;
    } catch (error) {
      throw new Error(`Nearby search failed: ${error.message}`);
    }
  }

  /**
   * Get detailed address components
   * @param {Array} addressComponents - Address components from geocoding result
   * @returns {Object} Parsed address components
   */
  parseAddressComponents(addressComponents) {
    const components = {};
    
    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        components.street = component.long_name;
      }
      if (types.includes('locality')) {
        components.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        components.state = component.long_name;
        components.stateShort = component.short_name;
      }
      if (types.includes('country')) {
        components.country = component.long_name;
        components.countryShort = component.short_name;
      }
      if (types.includes('postal_code')) {
        components.zipCode = component.long_name;
      }
      if (types.includes('neighborhood')) {
        components.neighborhood = component.long_name;
      }
    });

    // Construct full street address
    if (components.streetNumber && components.street) {
      components.streetAddress = `${components.streetNumber} ${components.street}`;
    } else if (components.street) {
      components.streetAddress = components.street;
    }

    return components;
  }

  /**
   * Validate if coordinates are within reasonable bounds
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {boolean} Whether coordinates are valid
   */
  validateCoordinates(lat, lng) {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  /**
   * Format address for display
   * @param {Object} addressComponents - Parsed address components
   * @param {string} format - Format type ('short', 'medium', 'full')
   * @returns {string} Formatted address
   */
  formatAddress(addressComponents, format = 'medium') {
    switch (format) {
      case 'short':
        return `${addressComponents.city || ''}, ${addressComponents.stateShort || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
      
      case 'medium':
        const parts = [
          addressComponents.streetAddress,
          addressComponents.city,
          addressComponents.stateShort
        ].filter(Boolean);
        return parts.join(', ');
      
      case 'full':
        const fullParts = [
          addressComponents.streetAddress,
          addressComponents.city,
          addressComponents.state,
          addressComponents.zipCode,
          addressComponents.country
        ].filter(Boolean);
        return fullParts.join(', ');
      
      default:
        return addressComponents.streetAddress || addressComponents.city || 'Unknown location';
    }
  }

  /**
   * Get location suggestions for autocomplete
   * @param {string} input - User input
   * @param {Object} options - Autocomplete options
   * @returns {Promise} Suggestion results
   */
  async getLocationSuggestions(input, options = {}) {
    if (!input || input.length < 3) {
      return [];
    }

    try {
      // Use geocoding for basic suggestions
      const result = await this.geocodeAddress(input, {
        ...options,
        region: options.region || 'US' // Default to US
      });
      
      return [result];
    } catch (error) {
      console.warn('Location suggestions failed:', error);
      return [];
    }
  }
}

// Create singleton instance
export const geocodingService = new GeocodingService();

export default geocodingService;
