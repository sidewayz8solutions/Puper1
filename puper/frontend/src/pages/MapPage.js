import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FaPlus, FaTimes, FaSearch, FaFilter, FaUsers,
  FaMapMarkerAlt, FaToilet, FaClock, FaWifi, FaBolt, FaSync,
  FaChartLine, FaGlobe, FaExpand, FaCompass, FaCrosshairs,
  FaCheckCircle, FaTimesCircle, FaStar
} from 'react-icons/fa';
import woodBg from '../assets/images/wood5.png';
import { restroomService, supabase } from '../services/supabase';
import { googlePlacesService, initGoogleMaps } from '../services/googleMaps';
import './MapPage.css';

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  
  // State management
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [restrooms, setRestrooms] = useState([]);
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [showAddForm, setShowAddForm] = useState(searchParams.get('add') === 'true');
  const [addMode, setAddMode] = useState(searchParams.get('add') === 'true');
  const [addLocation, setAddLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingRestroomId, setRatingRestroomId] = useState(null);
  const [detailedRating, setDetailedRating] = useState({
    overall: 0,
    cleanliness: 0,
    stocked: 0,
    availability: 0,
    comment: ''
  });
  const [newRestroomRating, setNewRestroomRating] = useState({
    overall: 0,
    cleanliness: 0,
    stocked: 0,
    availability: 0,
    comment: ''
  });
  
  // Stats
  const [stats, setStats] = useState({
    totalRestrooms: 0,
    averageRating: '0.0',
    recentlyAdded: 0,
    accessibleCount: 0,
    onlineUsers: 42,
    networkStatus: 'CONNECTING'
  });

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await initGoogleMaps();
        console.log('✅ Google Maps loaded');
        setupMap();
      } catch (e) {
        console.error('❌ Failed to load Google Maps', e);
        setLoading(false);
        alert('Failed to load Google Maps. Please check your internet connection.');
      }
    };

    const setupMap = () => {
      if (mapRef.current && !googleMapRef.current) {
        // Default to New Orleans
        const defaultCenter = { lat: 29.9511, lng: -90.0715 };
        
        const mapOptions = {
          center: defaultCenter,
          zoom: 13,
          mapId: process.env.REACT_APP_GOOGLE_MAPS_MAP_ID,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
          ],
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          gestureHandling: 'greedy'
        };

        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        googleMapRef.current = newMap;
        setMap(newMap);
        setInfoWindow(new window.google.maps.InfoWindow());
        setMapLoaded(true);

        // Add custom control for current location button with glow effect
        const locationButton = document.createElement('button');
        locationButton.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4), 0 0 20px rgba(118, 75, 162, 0.3);
            cursor: pointer;
            margin: 10px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          "
          onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 25px rgba(102, 126, 234, 0.6), 0 0 30px rgba(118, 75, 162, 0.5)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 20px rgba(102, 126, 234, 0.4), 0 0 20px rgba(118, 75, 162, 0.3)';">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
          </div>
        `;
        locationButton.title = 'Get My Current Location';
        locationButton.type = 'button';
        locationButton.style.cssText = 'background: none; border: none; padding: 0;';
        locationButton.addEventListener('click', () => {
          getUserLocation();
        });
        newMap.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);

        // Add click listener for adding restrooms
        newMap.addListener('click', (event) => {
          handleMapClick(event);
        });

        // Get user location immediately after map loads
        getUserLocation();
      }
    };

    initializeMap();
  }, []);

  // Get user location function
  const getUserLocation = () => {
    console.log('📍 Getting user location...');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      alert('Your browser does not support geolocation');
      return;
    }

    // Show loading state
    setStats(prev => ({ ...prev, networkStatus: 'LOCATING' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Got location:', position.coords);
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(location);
        setLocationError(null);
        
        // Update map
        if (googleMapRef.current) {
          googleMapRef.current.setCenter(location);
          googleMapRef.current.setZoom(15);
          
          // Remove old user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }
          
          // Add user location marker with pulsing animation
          const userMarker = new window.google.maps.Marker({
            position: location,
            map: googleMapRef.current,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 3
            },
            title: 'Your Location',
            zIndex: 1000
          });
          
          // Add pulsing circle overlay
          const pulsingCircle = new window.google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#4285F4',
            fillOpacity: 0.35,
            map: googleMapRef.current,
            center: location,
            radius: 100,
            zIndex: 999
          });
          
          // Animate the pulsing circle
          let radius = 100;
          let expanding = true;
          const pulseInterval = setInterval(() => {
            if (expanding) {
              radius += 2;
              if (radius >= 150) expanding = false;
            } else {
              radius -= 2;
              if (radius <= 100) expanding = true;
            }
            pulsingCircle.setRadius(radius);
          }, 50);
          
          userMarkerRef.current = userMarker;
          userMarkerRef.current.pulseInterval = pulseInterval;
          userMarkerRef.current.pulsingCircle = pulsingCircle;
        }
        
        // Load nearby restrooms
        if (map && mapLoaded) {
          loadRestrooms(location);
        }
        
        setStats(prev => ({ ...prev, networkStatus: 'CONNECTED' }));
      },
      (error) => {
        console.error('❌ Location error:', error);
        let errorMessage = 'Unable to get location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        
        setLocationError(errorMessage);
        alert(errorMessage);
        setStats(prev => ({ ...prev, networkStatus: 'CONNECTED' }));
        
        // Still load restrooms even without location
        if (map && mapLoaded) {
          loadRestrooms(null);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle map click
  const handleMapClick = (event) => {
    // Only handle clicks when in add mode
    if (!addMode) return;

    setAddLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });

    // Clear any existing temporary markers
    if (window.tempMarker) {
      window.tempMarker.setMap(null);
    }

    // Add temporary marker with cyan toilet icon for new location
    window.tempMarker = new window.google.maps.Marker({
      position: event.latLng,
      map: googleMapRef.current,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
            <!-- Drop shadow -->
            <ellipse cx="25" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.4)"/>
            <!-- Main marker body (cyan) -->
            <path d="M25 3C15.1 3 7 11.1 7 21c0 18 18 36 18 36s18-18 18-36C43 11.1 34.9 3 25 3z"
                  fill="#0dffe7" stroke="#00bfa5" stroke-width="2"/>
            <!-- Inner white circle -->
            <circle cx="25" cy="21" r="13" fill="white" stroke="#00bfa5" stroke-width="1.5"/>
            <!-- Plus icon for new restroom -->
            <text x="25" y="28" text-anchor="middle" fill="#00bfa5" font-size="24" font-weight="bold">+</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(50, 60),
        anchor: new window.google.maps.Point(25, 57)
      },
      title: 'New restroom location',
      animation: window.google.maps.Animation.BOUNCE
    });

    // Stop bouncing after 2 seconds
    setTimeout(() => {
      if (window.tempMarker) {
        window.tempMarker.setAnimation(null);
      }
    }, 2000);

    // Reset cursor to normal
    if (googleMapRef.current) {
      googleMapRef.current.setOptions({ draggableCursor: null });
    }

    setShowAddForm(true);
  };

  // Load restrooms when map is ready
  useEffect(() => {
    if (map && mapLoaded && userLocation) {
      loadRestrooms(userLocation);
    } else if (map && mapLoaded) {
      loadRestrooms(null);
    }
  }, [map, mapLoaded, userLocation]);

  // Open detailed rating modal
  const openRatingModal = (restroomId) => {
    setRatingRestroomId(restroomId);
    setDetailedRating({
      overall: 0,
      cleanliness: 0,
      stocked: 0,
      availability: 0,
      comment: ''
    });
    setShowRatingModal(true);
  };

  // Submit detailed rating
  const submitDetailedRating = async () => {
    try {
      console.log(`Submitting detailed rating for restroom ${ratingRestroomId}:`, detailedRating);

      // Calculate average rating
      const avgRating = (detailedRating.overall + detailedRating.cleanliness + 
                        detailedRating.stocked + detailedRating.availability) / 4;

      // Here you would typically make an API call to save the rating
      // For now, we'll just show a confirmation
      const confirmed = window.confirm(
        `Submit rating?\n\n` +
        `Overall: ${detailedRating.overall} 🚽\n` +
        `Cleanliness: ${detailedRating.cleanliness} 🚽\n` +
        `Stocked: ${detailedRating.stocked} 🚽\n` +
        `Availability: ${detailedRating.availability} 🚽\n` +
        `Average: ${avgRating.toFixed(1)} 🚽\n` +
        `${detailedRating.comment ? `Comment: ${detailedRating.comment}` : ''}`
      );

      if (confirmed) {
        // TODO: Implement actual rating API call
        alert(`Thank you for your detailed rating! Average: ${avgRating.toFixed(1)} toilets`);
        setShowRatingModal(false);
        
        // Optionally refresh the restrooms data to show updated rating
        loadRestrooms(userLocation);
      }
    } catch (error) {
      console.error('Error submitting detailed rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Add global rating function for info window clicks
  useEffect(() => {
    window.rateRestroom = (restroomId) => {
      openRatingModal(restroomId);
    };

    // Cleanup function
    return () => {
      delete window.rateRestroom;
    };
  }, [userLocation]);

  // Load restrooms function
  const loadRestrooms = async (location = null) => {
    try {
      setLoading(true);
      console.log('🔍 Loading restrooms...', location);

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      let supabaseRestrooms = [];
      let googleRestrooms = [];

      const centerLocation = location || { lat: 29.9511, lng: -90.0715 };

      // Load from Supabase
      try {
        supabaseRestrooms = await restroomService.getNearby(
          centerLocation.lat,
          centerLocation.lng,
          10000 // 10km radius
        );
        console.log('✅ Loaded from Supabase:', supabaseRestrooms.length);
      } catch (error) {
        console.warn('⚠️ Supabase error:', error);
      }

      // Load from Google Places if we have a valid location
      if (location) {
        try {
          if (!googlePlacesService.service && googleMapRef.current) {
            googlePlacesService.service = new window.google.maps.places.PlacesService(googleMapRef.current);
          }

          if (googlePlacesService.service) {
            googleRestrooms = await googlePlacesService.findAccessibleRestrooms(
              centerLocation.lat,
              centerLocation.lng,
              5000 // 5km radius
            );
            console.log('✅ Loaded from Google Places:', googleRestrooms.length);
          }
        } catch (error) {
          console.warn('⚠️ Google Places error:', error);
        }
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

      console.log('📊 Total restrooms:', combinedRestrooms.length);

      // Add markers for all restrooms with brown color and toilet icons
      const newMarkers = combinedRestrooms.map(restroom => {

        const rating = restroom.avg_rating || 0;
        const ratingColor = rating >= 4 ? '#27AE60' : rating >= 3 ? '#FFD700' : rating >= 2 ? '#FF6347' : '#E74C3C';

        // Create custom brown toilet marker for ALL restrooms
        const customIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
              <!-- Drop shadow -->
              <ellipse cx="25" cy="57" rx="10" ry="3" fill="rgba(0,0,0,0.4)"/>
              <!-- Main marker body (brown) -->
              <path d="M25 3C15.1 3 7 11.1 7 21c0 18 18 36 18 36s18-18 18-36C43 11.1 34.9 3 25 3z"
                    fill="#8B4513" stroke="#654321" stroke-width="2"/>
              <!-- Inner white circle -->
              <circle cx="25" cy="21" r="13" fill="white" stroke="#654321" stroke-width="1.5"/>
              <!-- Toilet icon -->
              <text x="25" y="28" text-anchor="middle" fill="#654321" font-size="20">🚽</text>
              <!-- Rating badge -->
              ${rating > 0 ? `
                <circle cx="38" cy="8" r="7" fill="${ratingColor}" stroke="white" stroke-width="2"/>
                <text x="38" y="12" text-anchor="middle" fill="white" font-size="9" font-weight="bold">${rating.toFixed(1)}</text>
              ` : ''}
            </svg>
          `),
          scaledSize: new window.google.maps.Size(50, 60),
          anchor: new window.google.maps.Point(25, 57)
        };

        const marker = new window.google.maps.Marker({
          position: {
            lat: restroom.lat,
            lng: restroom.lng || restroom.lon
          },
          map: googleMapRef.current,
          title: restroom.name,
          icon: customIcon,
          animation: window.google.maps.Animation.DROP
        });

        // Info window content with toilet rating system
        const sourceLabel = restroom.source === 'google_places' ? 'Google Places' : 'Community Added';
        const toiletRating = restroom.avg_rating || 0;

        // Create clickable toilet rating display
        const createToiletRatingDisplay = (currentRating) => {
          return Array(5).fill(0).map((_, i) => {
            const isActive = i < Math.round(currentRating);
            return `<span style="font-size: 24px; margin-right: 2px;">
              ${isActive ? '🚽' : '🚾'}
            </span>`;
          }).join('');
        };

        marker.addListener('click', () => {
          if (infoWindow) {
            infoWindow.setContent(`
              <div style="padding: 12px; min-width: 280px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
                <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 18px; font-weight: 600;">
                  🚽 ${restroom.name}
                </h3>
                <div style="margin: 8px 0; padding: 8px; background: #f7fafc; border-radius: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #4a5568; font-weight: 500;">Overall Rating:</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${createToiletRatingDisplay(toiletRating)}
                    <span style="color: #4a5568; font-weight: 500; font-size: 14px; margin-left: 8px;">
                      ${toiletRating.toFixed(1)} (${restroom.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
                
                ${restroom.cleanliness_rating ? `
                <div style="margin: 4px 0; padding: 4px 8px; background: #edf2f7; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 12px; color: #4a5568;">Cleanliness:</span>
                  <span style="font-size: 14px;">${'🚽'.repeat(Math.round(restroom.cleanliness_rating))}${'🚾'.repeat(5 - Math.round(restroom.cleanliness_rating))}</span>
                </div>
                ` : ''}
                
                ${restroom.stocked_rating ? `
                <div style="margin: 4px 0; padding: 4px 8px; background: #edf2f7; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 12px; color: #4a5568;">Stocked:</span>
                  <span style="font-size: 14px;">${'🚽'.repeat(Math.round(restroom.stocked_rating))}${'🚾'.repeat(5 - Math.round(restroom.stocked_rating))}</span>
                </div>
                ` : ''}
                
                ${restroom.availability_rating ? `
                <div style="margin: 4px 0; padding: 4px 8px; background: #edf2f7; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 12px; color: #4a5568;">Availability:</span>
                  <span style="font-size: 14px;">${'🚽'.repeat(Math.round(restroom.availability_rating))}${'🚾'.repeat(5 - Math.round(restroom.availability_rating))}</span>
                </div>
                ` : ''}
                
                <button
                  onclick="window.rateRestroom && window.rateRestroom('${restroom.id}')"
                  style="
                    width: 100%;
                    margin-top: 12px;
                    padding: 10px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                  "
                  onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)';"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)';"
                >
                  Rate This Restroom
                </button>
                
                <div style="margin: 8px 0; padding: 8px; background: #edf2f7; border-radius: 8px;">
                  <span style="color: ${restroom.wheelchair_accessible ? '#27AE60' : '#E74C3C'}; font-weight: 500; font-size: 12px;">
                    ♿ ${restroom.wheelchair_accessible ? 'Wheelchair Accessible' : 'Not Accessible'}
                  </span>
                </div>
                
                ${restroom.address ? `
                  <p style="margin: 8px 0 0 0; color: #718096; font-size: 13px; padding: 6px 8px; background: #f7fafc; border-radius: 6px; border-left: 3px solid #667eea;">
                    📍 ${restroom.address}
                  </p>
                ` : ''}
                
                <p style="margin: 8px 0 0 0; color: #a0aec0; font-size: 11px; font-style: italic; text-align: center;">
                  Source: ${sourceLabel}
                </p>
              </div>
            `);
            infoWindow.open(googleMapRef.current, marker);
            setSelectedRestroom(restroom);
          }
        });

        return marker;
      });

      markersRef.current = newMarkers;
      setRestrooms(combinedRestrooms);

      // Update stats
      setStats({
        totalRestrooms: combinedRestrooms.length,
        averageRating: combinedRestrooms.length > 0
          ? (combinedRestrooms.reduce((sum, r) => sum + (r.avg_rating || 0), 0) / combinedRestrooms.length).toFixed(1)
          : '0.0',
        recentlyAdded: combinedRestrooms.filter(r => {
          if (!r.created_at) return false;
          const createdDate = new Date(r.created_at);
          const today = new Date();
          return createdDate.toDateString() === today.toDateString();
        }).length,
        accessibleCount: combinedRestrooms.filter(r => r.wheelchair_accessible).length,
        onlineUsers: 42,
        networkStatus: 'CONNECTED'
      });

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading restrooms:', error);
      setLoading(false);
      setStats(prev => ({ ...prev, networkStatus: 'ERROR' }));
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      markersRef.current.forEach(marker => marker.setVisible(true));
      return;
    }

    markersRef.current.forEach((marker, index) => {
      const restroom = restrooms[index];
      const isVisible = restroom.name.toLowerCase().includes(query.toLowerCase());
      marker.setVisible(isVisible);
    });
  };

  // Handle adding a restroom
  const handleAddRestroom = async (data) => {
    try {
      console.log('➕ Adding restroom:', data);

      if (!data.name || !data.lat || !data.lng) {
        alert('Please provide all required information');
        return;
      }

      // Calculate average rating from the new restroom ratings
      const avgRating = (newRestroomRating.overall + newRestroomRating.cleanliness + 
                        newRestroomRating.stocked + newRestroomRating.availability) / 4;

      const newRestroom = await restroomService.createWithLocation({
        name: data.name,
        lat: data.lat,
        lng: data.lng,
        wheelchair_accessible: data.accessible || false,
        description: data.description || '',
        baby_changing: false,
        gender_neutral: false,
        requires_fee: false,
        verified: false,
        avg_rating: avgRating,
        overall_rating: newRestroomRating.overall,
        cleanliness_rating: newRestroomRating.cleanliness,
        stocked_rating: newRestroomRating.stocked,
        availability_rating: newRestroomRating.availability,
        rating_comment: newRestroomRating.comment,
        review_count: avgRating > 0 ? 1 : 0
      });

      console.log('✅ Restroom created with rating:', newRestroom);

      // Reset states
      setShowAddForm(false);
      setAddMode(false);
      setAddLocation(null);
      setNewRestroomRating({
        overall: 0,
        cleanliness: 0,
        stocked: 0,
        availability: 0,
        comment: ''
      });

      if (window.tempMarker) {
        window.tempMarker.setMap(null);
        window.tempMarker = null;
      }

      // Reload restrooms to include the new one
      loadRestrooms(userLocation);

      alert(`Restroom added successfully with rating: ${avgRating.toFixed(1)} 🚽!`);
    } catch (error) {
      console.error('❌ Error adding restroom:', error);
      alert(`Failed to add restroom: ${error.message}`);
    }
  };

  // Calculate distance helper
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  // Create toilet rating selector component
  const ToiletRatingSelector = ({ value, onChange, label }) => (
    <div className="toilet-rating-selector">
      <label>{label}</label>
      <div className="toilet-icons">
        {[1, 2, 3, 4, 5].map((rating) => (
          <span
            key={rating}
            className={`toilet-icon ${value >= rating ? 'active' : ''}`}
            onClick={() => onChange(rating)}
            style={{
              fontSize: '28px',
              cursor: 'pointer',
              margin: '0 4px',
              transition: 'all 0.2s ease',
              display: 'inline-block',
              transform: value >= rating ? 'scale(1.1)' : 'scale(1)',
              filter: value >= rating ? 'none' : 'grayscale(1) opacity(0.5)'
            }}
          >
            🚽
          </span>
        ))}
        <span style={{ marginLeft: '12px', color: '#4a5568', fontWeight: '500' }}>
          {value > 0 ? `${value} toilet${value !== 1 ? 's' : ''}` : 'Not rated'}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      className="map-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Map Container */}
      <div className="map-content">
        <div
          ref={mapRef}
          className="map-container"
          style={{ width: '100%', height: '100vh' }}
        />

        {/* Search Panel - Top Right */}
        <motion.div
          className="search-panel"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ backgroundImage: `url(${woodBg})` }}
        >
          <div className="search-content">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search restrooms..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="connection-status">
            <FaWifi className={`status-icon ${stats.networkStatus.toLowerCase()}`} />
            <span className="status-text">Status: {stats.networkStatus}</span>
          </div>
          <div className="control-buttons">
            <motion.button
              className={`add-restroom-btn ${addMode ? 'active' : ''}`}
              onClick={() => {
                if (addMode) {
                  // Cancel add mode
                  setAddMode(false);
                  setShowAddForm(false);
                  setAddLocation(null);
                  setNewRestroomRating({
                    overall: 0,
                    cleanliness: 0,
                    stocked: 0,
                    availability: 0,
                    comment: ''
                  });
                  if (window.tempMarker) {
                    window.tempMarker.setMap(null);
                    window.tempMarker = null;
                  }
                } else {
                  // Enter add mode
                  setAddMode(true);
                  setShowInstructions(true);
                  
                  // Show instructions briefly
                  setTimeout(() => {
                    setShowInstructions(false);
                  }, 3000);
                  
                  // Change cursor to crosshair
                  if (googleMapRef.current) {
                    googleMapRef.current.setOptions({ draggableCursor: 'crosshair' });
                  }
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {addMode ? (
                <>
                  <FaTimes />
                  <span>Cancel Adding</span>
                </>
              ) : (
                <>
                  <FaPlus />
                  <span>Add Restroom</span>
                </>
              )}
            </motion.button>
            <motion.button
              className="refresh-btn"
              onClick={() => {
                getUserLocation();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCrosshairs style={{ marginRight: 6 }} />
              Get My Location
            </motion.button>
          </div>
          {locationError && (
            <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              ⚠️ {locationError}
            </div>
          )}
        </motion.div>

        {/* Stats Panel - Bottom Left */}
        <motion.div
          className="stats-panel"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ backgroundImage: `url(${woodBg})` }}
        >
          <div className="stats-header">
            <FaChartLine className="stats-icon" />
            <span>Live Stats</span>
          </div>
          <div className="stats-content">
            <div className="stat-item">
              <FaMapMarkerAlt />
              <span className="stat-number">{stats.totalRestrooms}</span>
              <span className="stat-label">Locations</span>
            </div>
            <div className="stat-item">
              <FaToilet />
              <span className="stat-number">{stats.averageRating}</span>
              <span className="stat-label">Avg Rating</span>
            </div>
            <div className="stat-item">
              <FaUsers />
              <span className="stat-number">{stats.accessibleCount}</span>
              <span className="stat-label">Accessible</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Instructions Overlay */}
      <AnimatePresence>
        {showInstructions && addMode && (
          <motion.div
            className="instructions-toast"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="instructions-content-toast">
              <FaMapMarkerAlt className="instructions-icon" />
              <span>Click anywhere on the map to place a new restroom!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Restroom Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddForm(false);
              setAddMode(false);
              setAddLocation(null);
              setNewRestroomRating({
                overall: 0,
                cleanliness: 0,
                stocked: 0,
                availability: 0,
                comment: ''
              });
              if (window.tempMarker) {
                window.tempMarker.setMap(null);
                window.tempMarker = null;
              }
              // Reset cursor
              if (googleMapRef.current) {
                googleMapRef.current.setOptions({ draggableCursor: null });
              }
            }}
          >
            <motion.div
              className="add-restroom-modal-content"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundImage: `url(${woodBg})` }}
            >
              <div className="modal-header">
                <FaPlus className="modal-icon" />
                <span>Add & Rate New Restroom</span>
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddMode(false);
                    setAddLocation(null);
                    setNewRestroomRating({
                      overall: 0,
                      cleanliness: 0,
                      stocked: 0,
                      availability: 0,
                      comment: ''
                    });
                    if (window.tempMarker) {
                      window.tempMarker.setMap(null);
                      window.tempMarker = null;
                    }
                    // Reset cursor
                    if (googleMapRef.current) {
                      googleMapRef.current.setOptions({ draggableCursor: null });
                    }
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {addLocation ? (
                  <div className="location-confirmation">
                    <p style={{ color: 'var(--psychedelic-lime)', fontWeight: 'bold', marginBottom: '1rem' }}>
                      ✔ Location Selected: {addLocation.lat.toFixed(6)}, {addLocation.lng.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <p className="modal-instruction">
                    Click anywhere on the map to place your restroom!
                  </p>
                )}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleAddRestroom({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    lat: addLocation?.lat,
                    lng: addLocation?.lng,
                    accessible: formData.get('accessible') === 'on'
                  });
                }} className="restroom-form">
                  <input
                    type="text"
                    name="name"
                    placeholder="Restroom name (e.g., Starbucks on Main St)..."
                    required
                    className="form-input"
                  />
                  <textarea
                    name="description"
                    placeholder="Description (optional)..."
                    className="form-input"
                    rows="2"
                  />
                  
                  <div className="rating-section">
                    <h3 style={{ 
                      color: 'var(--psychedelic-lime)', 
                      fontFamily: 'Bebas Neue, cursive',
                      letterSpacing: '1px',
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      Rate This Restroom
                    </h3>
                    
                    <ToiletRatingSelector
                      label="Overall Experience"
                      value={newRestroomRating.overall}
                      onChange={(value) => setNewRestroomRating({...newRestroomRating, overall: value})}
                    />
                    
                    <ToiletRatingSelector
                      label="Cleanliness"
                      value={newRestroomRating.cleanliness}
                      onChange={(value) => setNewRestroomRating({...newRestroomRating, cleanliness: value})}
                    />
                    
                    <ToiletRatingSelector
                      label="Stocked (Paper, Soap, etc.)"
                      value={newRestroomRating.stocked}
                      onChange={(value) => setNewRestroomRating({...newRestroomRating, stocked: value})}
                    />
                    
                    <ToiletRatingSelector
                      label="Availability (Not Busy/Closed)"
                      value={newRestroomRating.availability}
                      onChange={(value) => setNewRestroomRating({...newRestroomRating, availability: value})}
                    />
                    
                    <textarea
                      placeholder="Additional notes about this restroom..."
                      value={newRestroomRating.comment}
                      onChange={(e) => setNewRestroomRating({...newRestroomRating, comment: e.target.value})}
                      className="form-input"
                      rows="2"
                      style={{ marginTop: '1rem' }}
                    />
                    
                    {(newRestroomRating.overall > 0 || newRestroomRating.cleanliness > 0 || 
                      newRestroomRating.stocked > 0 || newRestroomRating.availability > 0) && (
                      <div className="rating-summary" style={{ marginTop: '1rem' }}>
                        <div className="average-display">
                          <span>Average Rating: </span>
                          <strong>
                            {((newRestroomRating.overall + newRestroomRating.cleanliness + 
                               newRestroomRating.stocked + newRestroomRating.availability) / 4).toFixed(1)} 🚽
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <label className="form-checkbox">
                    <input type="checkbox" name="accessible" />
                    <span>♿ Wheelchair Accessible</span>
                  </label>
                  
                  <button
                    type="submit"
                    disabled={!addLocation}
                    className={`form-submit ${addLocation ? 'enabled' : 'disabled'}`}
                  >
                    {addLocation ? 'Add & Rate Restroom' : 'Select location on map first'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRatingModal(false)}
          >
            <motion.div
              className="rating-modal-content"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundImage: `url(${woodBg})` }}
            >
              <div className="modal-header">
                <FaToilet className="modal-icon" />
                <span>Rate This Restroom</span>
                <button
                  className="close-btn"
                  onClick={() => setShowRatingModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="rating-modal-body">
                <ToiletRatingSelector
                  label="Overall Experience"
                  value={detailedRating.overall}
                  onChange={(value) => setDetailedRating({...detailedRating, overall: value})}
                />
                
                <ToiletRatingSelector
                  label="Cleanliness"
                  value={detailedRating.cleanliness}
                  onChange={(value) => setDetailedRating({...detailedRating, cleanliness: value})}
                />
                
                <ToiletRatingSelector
                  label="Stocked (Paper, Soap, etc.)"
                  value={detailedRating.stocked}
                  onChange={(value) => setDetailedRating({...detailedRating, stocked: value})}
                />
                
                <ToiletRatingSelector
                  label="Availability (Not Busy/Closed)"
                  value={detailedRating.availability}
                  onChange={(value) => setDetailedRating({...detailedRating, availability: value})}
                />
                
                <div className="rating-comment-section">
                  <label>Additional Comments (Optional)</label>
                  <textarea
                    placeholder="Share your experience..."
                    value={detailedRating.comment}
                    onChange={(e) => setDetailedRating({...detailedRating, comment: e.target.value})}
                    className="form-input"
                    rows="3"
                  />
                </div>
                
                <div className="rating-summary">
                  <div className="average-display">
                    <span>Average Rating: </span>
                    <strong>
                      {((detailedRating.overall + detailedRating.cleanliness + 
                         detailedRating.stocked + detailedRating.availability) / 4).toFixed(1)} 🚽
                    </strong>
                  </div>
                </div>
                
                <button
                  className="form-submit enabled"
                  onClick={submitDetailedRating}
                  disabled={detailedRating.overall === 0}
                >
                  Submit Rating
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-content">
            <div className="holographic-loader">
              <FaGlobe className="spinning-globe" />
            </div>
            <span className="loading-text">LOADING RESTROOMS...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MapPage;