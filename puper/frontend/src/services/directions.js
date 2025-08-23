/**
 * Google Maps Directions Service for Puper
 * Provides turn-by-turn directions to restrooms
 */

export class DirectionsService {
  constructor() {
    this.directionsService = null;
    this.directionsRenderer = null;
    this.initializeService();
  }

  initializeService() {
    if (window.google && window.google.maps) {
      this.directionsService = new window.google.maps.DirectionsService();
      this.directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        draggable: true,
        polylineOptions: {
          strokeColor: '#6B4423', // Puper brown
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });
    } else {
      console.warn('Google Maps not loaded yet');
    }
  }

  /**
   * Calculate and display route between two points
   * @param {Object} origin - Starting location { lat, lng } or address string
   * @param {Object} destination - Ending location { lat, lng } or address string
   * @param {Object} options - Route options
   * @returns {Promise} Directions result
   */
  async calculateRoute(origin, destination, options = {}) {
    if (!this.directionsService) {
      this.initializeService();
      if (!this.directionsService) {
        throw new Error('Google Maps Directions service not available');
      }
    }

    const request = {
      origin: origin,
      destination: destination,
      travelMode: options.travelMode || window.google.maps.TravelMode.WALKING,
      unitSystem: options.unitSystem || window.google.maps.UnitSystem.METRIC,
      avoidHighways: options.avoidHighways || false,
      avoidTolls: options.avoidTolls || false,
      optimizeWaypoints: options.optimizeWaypoints || false,
      waypoints: options.waypoints || []
    };

    return new Promise((resolve, reject) => {
      this.directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          const processedResult = this.processDirectionsResult(result);
          resolve(processedResult);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  }

  /**
   * Process directions result to extract useful information
   * @param {Object} result - Google Maps directions result
   * @returns {Object} Processed directions data
   */
  processDirectionsResult(result) {
    const route = result.routes[0];
    const leg = route.legs[0];

    return {
      originalResult: result,
      summary: {
        distance: leg.distance,
        duration: leg.duration,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        startLocation: leg.start_location,
        endLocation: leg.end_location
      },
      steps: leg.steps.map((step, index) => ({
        stepNumber: index + 1,
        instruction: step.instructions,
        distance: step.distance,
        duration: step.duration,
        startLocation: step.start_location,
        endLocation: step.end_location,
        maneuver: step.maneuver,
        travelMode: step.travel_mode,
        htmlInstructions: step.instructions,
        plainTextInstructions: this.stripHtml(step.instructions)
      })),
      polyline: route.overview_polyline,
      bounds: route.bounds,
      copyrights: route.copyrights,
      warnings: route.warnings
    };
  }

  /**
   * Display directions on map and in panel
   * @param {Object} map - Google Maps instance
   * @param {Element} panel - DOM element for directions panel
   * @param {Object} directionsResult - Processed directions result
   */
  displayDirections(map, panel, directionsResult) {
    if (!this.directionsRenderer) {
      this.initializeService();
    }

    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(map);
      
      if (panel) {
        this.directionsRenderer.setPanel(panel);
      }
      
      this.directionsRenderer.setDirections(directionsResult.originalResult);
    }
  }

  /**
   * Clear directions from map and panel
   */
  clearDirections() {
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer.setPanel(null);
    }
  }

  /**
   * Get directions to nearest restroom
   * @param {Object} userLocation - User's current location
   * @param {Array} restrooms - Array of restroom objects
   * @param {Object} options - Route options
   * @returns {Promise} Directions to closest restroom
   */
  async getDirectionsToNearestRestroom(userLocation, restrooms, options = {}) {
    if (!restrooms || restrooms.length === 0) {
      throw new Error('No restrooms provided');
    }

    // Find closest restroom (you might want to use your distance matrix service here)
    const closestRestroom = this.findClosestRestroom(userLocation, restrooms);
    
    const destination = {
      lat: closestRestroom.lat,
      lng: closestRestroom.lon || closestRestroom.lng
    };

    const directions = await this.calculateRoute(userLocation, destination, options);
    
    return {
      ...directions,
      restroom: closestRestroom,
      destinationName: closestRestroom.name
    };
  }

  /**
   * Get multiple route options (different travel modes)
   * @param {Object} origin - Starting location
   * @param {Object} destination - Ending location
   * @returns {Promise} Multiple route options
   */
  async getMultipleRouteOptions(origin, destination) {
    const travelModes = [
      window.google.maps.TravelMode.WALKING,
      window.google.maps.TravelMode.DRIVING,
      window.google.maps.TravelMode.BICYCLING,
      window.google.maps.TravelMode.TRANSIT
    ];

    const routePromises = travelModes.map(async (mode) => {
      try {
        const result = await this.calculateRoute(origin, destination, { travelMode: mode });
        return {
          travelMode: mode,
          ...result
        };
      } catch (error) {
        return {
          travelMode: mode,
          error: error.message
        };
      }
    });

    const routes = await Promise.all(routePromises);
    return routes.filter(route => !route.error);
  }

  /**
   * Find closest restroom by straight-line distance
   * @param {Object} userLocation - User's location
   * @param {Array} restrooms - Array of restrooms
   * @returns {Object} Closest restroom
   */
  findClosestRestroom(userLocation, restrooms) {
    let closestRestroom = restrooms[0];
    let minDistance = this.calculateStraightLineDistance(
      userLocation, 
      { lat: restrooms[0].lat, lng: restrooms[0].lon || restrooms[0].lng }
    );

    restrooms.forEach(restroom => {
      const distance = this.calculateStraightLineDistance(
        userLocation,
        { lat: restroom.lat, lng: restroom.lon || restroom.lng }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestRestroom = restroom;
      }
    });

    return closestRestroom;
  }

  /**
   * Calculate straight-line distance between two points
   * @param {Object} point1 - First point { lat, lng }
   * @param {Object} point2 - Second point { lat, lng }
   * @returns {number} Distance in meters
   */
  calculateStraightLineDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Strip HTML tags from text
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Format duration for display
   * @param {Object} duration - Google Maps duration object
   * @returns {string} Formatted duration
   */
  formatDuration(duration) {
    if (!duration) return 'Unknown';
    return duration.text;
  }

  /**
   * Format distance for display
   * @param {Object} distance - Google Maps distance object
   * @returns {string} Formatted distance
   */
  formatDistance(distance) {
    if (!distance) return 'Unknown';
    return distance.text;
  }

  /**
   * Get travel mode icon
   * @param {string} travelMode - Google Maps travel mode
   * @returns {string} Icon character or emoji
   */
  getTravelModeIcon(travelMode) {
    const icons = {
      [window.google.maps.TravelMode.WALKING]: '🚶',
      [window.google.maps.TravelMode.DRIVING]: '🚗',
      [window.google.maps.TravelMode.BICYCLING]: '🚴',
      [window.google.maps.TravelMode.TRANSIT]: '🚌'
    };
    
    return icons[travelMode] || '📍';
  }
}

// Create singleton instance
export const directionsService = new DirectionsService();

export default directionsService;
