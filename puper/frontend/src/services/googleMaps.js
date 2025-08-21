import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

let googleMapsLoaded = false;
let googleMapsPromise = null;

// Initialize Google Maps
export const initGoogleMaps = () => {
  if (googleMapsLoaded) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const loader = new Loader({
    apiKey: GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'geometry']
  });

  googleMapsPromise = loader.load().then(() => {
    googleMapsLoaded = true;
    return window.google;
  });

  return googleMapsPromise;
};

// Google Places service for finding restrooms
export class GooglePlacesService {
  constructor() {
    this.service = null;
    this.map = null;
  }

  async initialize(mapElement) {
    await initGoogleMaps();
    
    // Create a hidden map for the service
    this.map = new window.google.maps.Map(mapElement || document.createElement('div'), {
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 15
    });
    
    this.service = new window.google.maps.places.PlacesService(this.map);
  }

  // Find nearby restrooms using Google Places
  async findNearbyRestrooms(lat, lng, radius = 5000) {
    if (!this.service) {
      throw new Error('Google Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request = {
        location: new window.google.maps.LatLng(lat, lng),
        radius: radius,
        keyword: 'restroom toilet bathroom public facilities',
        type: ['establishment']
      };

      this.service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const restrooms = results.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            price_level: place.price_level,
            opening_hours: place.opening_hours,
            photos: place.photos,
            types: place.types,
            business_status: place.business_status,
            permanently_closed: place.permanently_closed,
            distance: this.calculateDistance(lat, lng, place.geometry.location.lat(), place.geometry.location.lng())
          }));
          
          resolve(restrooms);
        } else {
          reject(new Error(`Places service failed: ${status}`));
        }
      });
    });
  }

  // Search for specific restroom locations
  async searchRestrooms(query, lat, lng, radius = 10000) {
    if (!this.service) {
      throw new Error('Google Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request = {
        location: new window.google.maps.LatLng(lat, lng),
        radius: radius,
        query: `${query} restroom toilet bathroom`,
        type: ['establishment']
      };

      this.service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const restrooms = results.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            price_level: place.price_level,
            opening_hours: place.opening_hours,
            photos: place.photos,
            types: place.types,
            business_status: place.business_status,
            distance: this.calculateDistance(lat, lng, place.geometry.location.lat(), place.geometry.location.lng())
          }));
          
          resolve(restrooms);
        } else {
          reject(new Error(`Text search failed: ${status}`));
        }
      });
    });
  }

  // Get detailed information about a specific place
  async getPlaceDetails(placeId) {
    if (!this.service) {
      throw new Error('Google Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request = {
        placeId: placeId,
        fields: [
          'name', 'formatted_address', 'geometry', 'rating', 
          'user_ratings_total', 'reviews', 'opening_hours', 
          'photos', 'website', 'formatted_phone_number',
          'price_level', 'types', 'business_status'
        ]
      };

      this.service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            reviews: place.reviews || [],
            opening_hours: place.opening_hours,
            photos: place.photos,
            website: place.website,
            phone: place.formatted_phone_number,
            price_level: place.price_level,
            types: place.types,
            business_status: place.business_status
          });
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }

  // Find restrooms along a route
  async findRestroomsAlongRoute(waypoints, radius = 2000) {
    const allRestrooms = [];
    
    for (const waypoint of waypoints) {
      try {
        const restrooms = await this.findNearbyRestrooms(waypoint.lat, waypoint.lng, radius);
        allRestrooms.push(...restrooms);
      } catch (error) {
        console.warn(`Failed to find restrooms near waypoint:`, error);
      }
    }

    // Remove duplicates based on place_id
    const uniqueRestrooms = allRestrooms.filter((restroom, index, self) => 
      index === self.findIndex(r => r.id === restroom.id)
    );

    return uniqueRestrooms.sort((a, b) => a.distance - b.distance);
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return Math.round(d * 1000); // Return distance in meters
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

// Geocoding service
export const geocodeAddress = async (address) => {
  await initGoogleMaps();
  
  const geocoder = new window.google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          formatted_address: results[0].formatted_address
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

// Reverse geocoding service
export const reverseGeocode = async (lat, lng) => {
  await initGoogleMaps();
  
  const geocoder = new window.google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve({
          formatted_address: results[0].formatted_address,
          address_components: results[0].address_components
        });
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
};

// Create a singleton instance
export const googlePlacesService = new GooglePlacesService();

export default {
  initGoogleMaps,
  GooglePlacesService,
  googlePlacesService,
  geocodeAddress,
  reverseGeocode
};
