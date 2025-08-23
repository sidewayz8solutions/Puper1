/**
 * Google Maps Distance Matrix Service for Puper
 * Calculates travel distances and times to restrooms
 */

export class DistanceMatrixService {
  constructor() {
    this.service = null;
    this.initializeService();
  }

  initializeService() {
    if (window.google && window.google.maps) {
      this.service = new window.google.maps.DistanceMatrixService();
    } else {
      console.warn('Google Maps not loaded yet');
    }
  }

  /**
   * Calculate distances from user location to multiple restrooms
   * @param {Object} userLocation - { lat, lng }
   * @param {Array} restrooms - Array of restroom objects with lat/lng
   * @param {Object} options - Travel options
   * @returns {Promise} Distance matrix results
   */
  async calculateDistancesToRestrooms(userLocation, restrooms, options = {}) {
    if (!this.service) {
      this.initializeService();
      if (!this.service) {
        throw new Error('Google Maps Distance Matrix service not available');
      }
    }

    const destinations = restrooms.map(restroom => ({
      lat: restroom.lat,
      lng: restroom.lon || restroom.lng
    }));

    const request = {
      origins: [userLocation],
      destinations: destinations,
      travelMode: options.travelMode || window.google.maps.TravelMode.WALKING,
      unitSystem: options.unitSystem || window.google.maps.UnitSystem.METRIC,
      avoidHighways: options.avoidHighways || false,
      avoidTolls: options.avoidTolls || false
    };

    return new Promise((resolve, reject) => {
      this.service.getDistanceMatrix(request, (response, status) => {
        if (status === 'OK') {
          const results = this.parseDistanceMatrixResponse(response, restrooms);
          resolve(results);
        } else {
          reject(new Error(`Distance Matrix request failed: ${status}`));
        }
      });
    });
  }

  /**
   * Parse the Distance Matrix API response
   * @param {Object} response - Google Maps API response
   * @param {Array} restrooms - Original restroom data
   * @returns {Array} Enhanced restrooms with distance/duration data
   */
  parseDistanceMatrixResponse(response, restrooms) {
    const results = [];
    
    if (response.rows && response.rows[0]) {
      const elements = response.rows[0].elements;
      
      elements.forEach((element, index) => {
        const restroom = restrooms[index];
        
        if (element.status === 'OK') {
          results.push({
            ...restroom,
            distance: {
              text: element.distance.text,
              value: element.distance.value, // meters
              km: (element.distance.value / 1000).toFixed(1)
            },
            duration: {
              text: element.duration.text,
              value: element.duration.value, // seconds
              minutes: Math.round(element.duration.value / 60)
            },
            walkingTime: element.duration.text,
            distanceMeters: element.distance.value
          });
        } else {
          // Include restroom even if distance calculation failed
          results.push({
            ...restroom,
            distance: { text: 'Unknown', value: null, km: 'N/A' },
            duration: { text: 'Unknown', value: null, minutes: null },
            walkingTime: 'Unknown',
            distanceMeters: null
          });
        }
      });
    }

    // Sort by distance (closest first)
    return results.sort((a, b) => {
      if (a.distanceMeters === null) return 1;
      if (b.distanceMeters === null) return -1;
      return a.distanceMeters - b.distanceMeters;
    });
  }

  /**
   * Get travel time to a single restroom
   * @param {Object} userLocation - { lat, lng }
   * @param {Object} restroom - Restroom object with lat/lng
   * @param {Object} options - Travel options
   * @returns {Promise} Single distance result
   */
  async getTravelTimeToRestroom(userLocation, restroom, options = {}) {
    const results = await this.calculateDistancesToRestrooms(
      userLocation, 
      [restroom], 
      options
    );
    return results[0];
  }

  /**
   * Find the closest restrooms with travel times
   * @param {Object} userLocation - { lat, lng }
   * @param {Array} restrooms - Array of restrooms
   * @param {number} limit - Number of closest restrooms to return
   * @param {Object} options - Travel options
   * @returns {Promise} Closest restrooms with distance data
   */
  async findClosestRestrooms(userLocation, restrooms, limit = 5, options = {}) {
    const results = await this.calculateDistancesToRestrooms(
      userLocation, 
      restrooms, 
      options
    );
    
    return results
      .filter(r => r.distanceMeters !== null)
      .slice(0, limit);
  }

  /**
   * Get travel options for different modes
   * @returns {Object} Available travel modes
   */
  getTravelModes() {
    if (!window.google || !window.google.maps) {
      return {};
    }

    return {
      WALKING: window.google.maps.TravelMode.WALKING,
      DRIVING: window.google.maps.TravelMode.DRIVING,
      BICYCLING: window.google.maps.TravelMode.BICYCLING,
      TRANSIT: window.google.maps.TravelMode.TRANSIT
    };
  }

  /**
   * Format duration for display
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    
    const minutes = Math.round(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${minutes} min`;
    }
  }

  /**
   * Format distance for display
   * @param {number} meters - Distance in meters
   * @returns {string} Formatted distance
   */
  formatDistance(meters) {
    if (!meters) return 'Unknown';
    
    if (meters < 1000) {
      return `${meters}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }
}

// Create singleton instance
export const distanceMatrixService = new DistanceMatrixService();

export default distanceMatrixService;
