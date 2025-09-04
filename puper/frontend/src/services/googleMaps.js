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

  // Search for establishments by address
  async searchEstablishmentsByAddress(address, searchQuery = '') {
    if (!this.service) {
      throw new Error('Google Places service not initialized');
    }

    // First, geocode the address to get coordinates
    const geocoder = new window.google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address }, (geocodeResults, geocodeStatus) => {
        if (geocodeStatus !== 'OK' || !geocodeResults.length) {
          reject(new Error(`Geocoding failed for address: ${address}`));
          return;
        }

        const location = geocodeResults[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        // Now search for establishments near this address
        const request = {
          location: location,
          radius: 5000, // 5km radius around the address
          query: searchQuery || 'restaurant store shop establishment',
          type: ['establishment']
        };

        this.service.textSearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const establishments = results.map(place => ({
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
              distance: this.calculateDistance(lat, lng, place.geometry.location.lat(), place.geometry.location.lng()),
              searchLocation: {
                lat: lat,
                lng: lng,
                address: geocodeResults[0].formatted_address
              }
            }));

            resolve({
              establishments,
              searchLocation: {
                lat: lat,
                lng: lng,
                address: geocodeResults[0].formatted_address
              }
            });
          } else {
            reject(new Error(`Establishment search failed: ${status}`));
          }
        });
      });
    });
  }

  // Search for restrooms at a specific establishment
  async searchRestroomsAtEstablishment(establishmentName, address) {
    if (!this.service) {
      throw new Error('Google Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const query = `${establishmentName} ${address} restroom toilet bathroom`;

      const request = {
        query: query,
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
            establishment_name: establishmentName
          }));

          resolve(restrooms);
        } else {
          reject(new Error(`Restroom search at establishment failed: ${status}`));
        }
      });
    });
  }

  // Get detailed information about a specific place with accessibility data
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
          'price_level', 'types', 'business_status',
          // Accessibility fields
          'wheelchair_accessible_entrance',
          'wheelchair_accessible_restroom',
          'wheelchair_accessible_parking'
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
            business_status: place.business_status,
            // Accessibility information
            wheelchair_accessible_entrance: place.wheelchair_accessible_entrance,
            wheelchair_accessible_restroom: place.wheelchair_accessible_restroom,
            wheelchair_accessible_parking: place.wheelchair_accessible_parking
          });
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }

  // Find restrooms with accessibility information using the new Places API
  async findAccessibleRestrooms(lat, lng, radius = 5000) {
    try {
      // Use the new Places API for better accessibility data
      const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.accessibilityOptions,places.restroom,places.types'
        },
        body: JSON.stringify({
          includedTypes: ['restaurant', 'gas_station', 'shopping_mall', 'park', 'tourist_attraction'],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: lat,
                longitude: lng
              },
              radius: radius
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Places API request failed: ${response.status}`);
      }

      const data = await response.json();

      return (data.places || [])
        .filter(place => place.restroom || place.accessibilityOptions?.wheelchairAccessibleRestroom)
        .map(place => ({
          id: place.id,
          name: place.displayName?.text || 'Unknown Location',
          address: place.formattedAddress,
          lat: place.location.latitude,
          lng: place.location.longitude,
          rating: place.rating || 0,
          user_ratings_total: place.userRatingCount || 0,
          wheelchair_accessible: place.accessibilityOptions?.wheelchairAccessibleRestroom || false,
          wheelchair_accessible_entrance: place.accessibilityOptions?.wheelchairAccessibleEntrance || false,
          wheelchair_accessible_parking: place.accessibilityOptions?.wheelchairAccessibleParking || false,
          has_restroom: place.restroom || false,
          types: place.types || [],
          distance: this.calculateDistance(lat, lng, place.location.latitude, place.location.longitude),
          source: 'google_places'
        }));
    } catch (error) {
      console.warn('New Places API failed, falling back to legacy API:', error);
      // Fallback to legacy API
      return this.findNearbyRestrooms(lat, lng, radius);
    }
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
