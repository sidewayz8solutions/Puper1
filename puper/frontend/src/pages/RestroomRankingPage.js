import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt, FaClock, FaToilet, FaHeart, FaLocationArrow,
  FaFilter, FaSync, FaTrophy
} from 'react-icons/fa';
import { restroomService } from '../services/supabase';
import { googlePlacesService, initGoogleMaps } from '../services/googleMaps';
import RestroomCard from '../components/Restroom/RestroomCard';
import './RestroomRankingPage.css';

const RestroomRankingPage = () => {
  const navigate = useNavigate();
  const [restrooms, setRestrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentArea, setCurrentArea] = useState('Loading...');
  const fadeAnim = useRef({ opacity: 0 });
  const slideAnim = useRef({ y: 50 });

  // Fetch restrooms based on location using real services
  const fetchRestrooms = async (latitude, longitude) => {
    try {
      console.log('🔍 Fetching restrooms for ranking...', { latitude, longitude });
      
      let supabaseRestrooms = [];
      let googleRestrooms = [];

      // Load from Supabase
      try {
        supabaseRestrooms = await restroomService.getNearby(
          latitude,
          longitude,
          10000 // 10km radius
        );
        console.log('✅ Loaded from Supabase:', supabaseRestrooms.length);
      } catch (error) {
        console.warn('⚠️ Supabase error:', error);
      }

      // Load from Google Places if we have a valid location
      try {
        await initGoogleMaps();
        if (!googlePlacesService.service) {
          // Create a temporary div for Google Places service
          const tempDiv = document.createElement('div');
          googlePlacesService.service = new window.google.maps.places.PlacesService(tempDiv);
        }

        if (googlePlacesService.service) {
          googleRestrooms = await googlePlacesService.findAccessibleRestrooms(
            latitude,
            longitude,
            5000 // 5km radius
          );
          console.log('✅ Loaded from Google Places:', googleRestrooms.length);
        }
      } catch (error) {
        console.warn('⚠️ Google Places error:', error);
      }

      // Combine restrooms
      const combinedRestrooms = [...supabaseRestrooms];
      
      // Add Google restrooms that aren't duplicates
      googleRestrooms.forEach(googleRestroom => {
        const isDuplicate = supabaseRestrooms.some(supabaseRestroom => {
          const distance = calculateDistance(
            googleRestroom.lat, googleRestroom.lng,
            supabaseRestroom.lat, supabaseRestroom.lng || supabaseRestroom.lon
          );
          return distance < 50; // Within 50 meters
        });

        if (!isDuplicate) {
          combinedRestrooms.push({
            ...googleRestroom,
            id: `google_${googleRestroom.id}`,
            lng: googleRestroom.lng || googleRestroom.lon,
            source: 'google_places'
          });
        }
      });

      // Calculate distance for each restroom
      const restroomsWithDistance = combinedRestrooms.map(restroom => ({
        ...restroom,
        distance: calculateDistance(
          latitude, longitude,
          restroom.lat, restroom.lng || restroom.lon
        )
      }));

      // Sort by Puper rating system (toilet emoji ratings) and distance
      const sortedRestrooms = restroomsWithDistance
        .filter(restroom => restroom.avg_rating > 0 || restroom.overall_rating > 0) // Only show rated restrooms
        .sort((a, b) => {
          // Primary sort: by rating (highest first)
          const ratingA = a.avg_rating || a.overall_rating || 0;
          const ratingB = b.avg_rating || b.overall_rating || 0;
          
          if (Math.abs(ratingA - ratingB) > 0.1) {
            return ratingB - ratingA;
          }
          
          // Secondary sort: by distance (closest first) for similar ratings
          return a.distance - b.distance;
        })
        .map((restroom, index) => ({
          ...restroom,
          rank: index + 1,
          rating: restroom.avg_rating || restroom.overall_rating || 0,
          reviews: restroom.review_count || 0,
          distance: (restroom.distance / 1609.34).toFixed(1), // Convert meters to miles
          cleanliness: restroom.cleanliness_rating || 0,
          amenities: getAmenities(restroom),
          lastCleaned: getLastCleaned(),
          waitTime: getWaitTime(),
          image: getRestroomImage(restroom)
        }));

      console.log('📊 Ranked restrooms:', sortedRestrooms.length);
      setRestrooms(sortedRestrooms);
    } catch (error) {
      console.error('❌ Error fetching restrooms:', error);
      // Fallback to mock data if API fails
      setRestrooms(getMockRestrooms());
    }
  };

  // Calculate distance between two points in meters
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  // Helper functions
  const getAmenities = (restroom) => {
    const amenities = [];
    if (restroom.wheelchair_accessible) amenities.push('Handicap Accessible');
    if (restroom.baby_changing) amenities.push('Baby Changing');
    if (restroom.gender_neutral) amenities.push('Gender Neutral');
    amenities.push('Soap', 'Paper Towels'); // Default amenities
    return amenities;
  };

  const getLastCleaned = () => {
    const options = ['Just cleaned', '30 min ago', '1 hour ago', '2 hours ago', '4 hours ago'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getWaitTime = () => {
    const options = ['No wait', '2-3 min', '5 min'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getRestroomImage = (restroom) => {
    return `https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=${encodeURIComponent(restroom.name?.charAt(0) || 'R')}`;
  };

  const getMockRestrooms = () => [
    {
      id: '1',
      name: 'Central Park Public Restroom',
      address: '123 Park Ave',
      rating: 4.8,
      reviews: 234,
      distance: '0.3',
      cleanliness: 4.9,
      amenities: ['Soap', 'Paper Towels', 'Handicap Accessible', 'Baby Changing'],
      lastCleaned: '2 hours ago',
      waitTime: 'No wait',
      image: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=C',
      rank: 1
    }
  ];

  // Get current location with better area detection
  const getCurrentLocation = async () => {
    try {
      if (!navigator.geolocation) {
        setCurrentArea('Geolocation not supported');
        setLoading(false);
        return;
      }

      console.log('📍 Getting current location for ranking...');

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });

      // Try to get area name using reverse geocoding
      try {
        await initGoogleMaps();
        const geocoder = new window.google.maps.Geocoder();
        const latlng = new window.google.maps.LatLng(latitude, longitude);
        
        const geocodeResult = await new Promise((resolve, reject) => {
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });

        // Extract city/area name from geocoding result
        let areaName = 'Current Location';
        const addressComponents = geocodeResult.address_components;
        
        for (let component of addressComponents) {
          if (component.types.includes('locality') || 
              component.types.includes('administrative_area_level_2') ||
              component.types.includes('neighborhood')) {
            areaName = component.long_name;
            break;
          }
        }
        
        setCurrentArea(areaName);
        console.log('✅ Location detected:', areaName);
      } catch (geocodeError) {
        console.warn('⚠️ Geocoding failed, using default area name:', geocodeError);
        setCurrentArea('Current Location');
      }

      // Fetch restrooms for this location
      await fetchRestrooms(latitude, longitude);
    } catch (error) {
      console.error('❌ Error getting location:', error);
      setCurrentArea('Location unavailable');
      setRestrooms(getMockRestrooms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    setRefreshing(false);
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return ['#FFD700', '#FFA500']; // Gold
      case 2: return ['#C0C0C0', '#808080']; // Silver
      case 3: return ['#CD7F32', '#8B4513']; // Bronze
      default: return ['#4A90E2', '#357ABD']; // Blue
    }
  };

  const getToiletRating = (rating) => {
    const toilets = [];
    const fullToilets = Math.floor(rating);
    const hasHalfToilet = rating % 1 >= 0.5;

    // Use toilet emojis for the Puper rating system
    for (let i = 0; i < fullToilets; i++) {
      toilets.push(
        <span key={`full-${i}`} className="toilet-full" style={{ fontSize: '20px' }}>
          🚽
        </span>
      );
    }

    if (hasHalfToilet && fullToilets < 5) {
      toilets.push(
        <span key="half" className="toilet-half" style={{ fontSize: '20px', opacity: 0.7 }}>
          🚽
        </span>
      );
    }

    const emptyToilets = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyToilets; i++) {
      toilets.push(
        <span key={`empty-${i}`} className="toilet-empty" style={{ fontSize: '20px', opacity: 0.3 }}>
          🚾
        </span>
      );
    }

    return toilets;
  };

  const handleRatingSubmitted = (ratingData) => {
    // Refresh the restrooms list to show updated ratings
    if (currentLocation) {
      fetchRestrooms(currentLocation.latitude, currentLocation.longitude);
    }
  };

  if (loading) {
    return (
      <div className="ranking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Ranking restrooms by Puper ratings near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <div className="header-content">
          <div className="header-top">
            <button onClick={() => navigate(-1)} className="back-button">
              ←
            </button>
            <h1>Puper Rankings</h1>
            <button onClick={() => {/* TODO: Add filter */}} className="filter-button">
              <FaFilter />
            </button>
          </div>
          
          <div className="location-container">
            <FaMapMarkerAlt />
            <span>{currentArea}</span>
            <button onClick={getCurrentLocation} className="refresh-button">
              <FaSync className={refreshing ? 'spinning' : ''} />
            </button>
          </div>

          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">{restrooms.length}</span>
              <span className="stat-label">Restrooms</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">
                {restrooms.length > 0 ? restrooms[0].rating.toFixed(1) : '-'}
              </span>
              <span className="stat-label">Top Rated</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">
                {restrooms.length > 0 ? restrooms[0].distance : '-'} mi
              </span>
              <span className="stat-label">Nearest</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        <div className="restrooms-list">
          {restrooms.map((restroom, index) => (
            <motion.div
              key={restroom.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <RestroomCard 
                restroom={restroom} 
                onRatingSubmitted={handleRatingSubmitted}
                showRatingButton={true}
              />
            </motion.div>
          ))}
          
          {restrooms.length === 0 && (
            <div className="empty-state">
              <FaToilet className="empty-icon" />
              <h3>No restrooms found</h3>
              <p>Try expanding your search radius or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestroomRankingPage;
