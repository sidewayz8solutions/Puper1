import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FaPlus, FaTimes, FaSearch, FaFilter, FaUsers,
  FaMapMarkerAlt, FaToilet, FaClock, FaWifi, FaBolt, FaSync,
  FaChartLine, FaGlobe, FaExpand, FaCompass
} from 'react-icons/fa';
import woodBg from '../assets/images/wood5.png';
import { restroomService, supabase } from '../services/supabase';
import { googlePlacesService, initGoogleMaps, reverseGeocode } from '../services/googleMaps';
import { useAuth } from '../context/AuthContext';
import RatingForm from '../components/Rating/RatingForm';
import './MapPage.css';

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  
  // State management
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState(null);
  const [restrooms, setRestrooms] = useState([]);
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLocation, setAddLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingRestroom, setRatingRestroom] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalRestrooms: 0,
    averageRating: '0.0',
    recentlyAdded: 0,
    accessibleCount: 0,
    onlineUsers: 42,
    networkStatus: 'CONNECTING'
  });

  // Mock restroom data (replace with your API)
  const mockRestrooms = [
    {
      id: 1,
      name: "French Quarter Public Restroom",
      lat: 29.9584,
      lng: -90.0644,
      rating: 4.5,
      accessible: true,
      reviews: 23
    },
    {
      id: 2,
      name: "Jackson Square Facilities",
      lat: 29.9574,
      lng: -90.0628,
      rating: 4.0,
      accessible: true,
      reviews: 15
    },
    {
      id: 3,
      name: "City Park Restroom",
      lat: 29.9934,
      lng: -90.0989,
      rating: 3.8,
      accessible: false,
      reviews: 8
    },
    {
      id: 4,
      name: "Audubon Park Facilities",
      lat: 29.9289,
      lng: -90.1284,
      rating: 4.2,
      accessible: true,
      reviews: 12
    },
    {
      id: 5,
      name: "Bourbon Street Public Restroom",
      lat: 29.9611,
      lng: -90.0661,
      rating: 3.5,
      accessible: false,
      reviews: 30
    }
  ];

  // Set up global initMap function for Google Maps API callback
  window.initMap = () => setMapsApiLoaded(true);

  // Smart polling for updates (visibility-aware with basic backoff)
  useEffect(() => {
    let pollInterval = null;
    let isVisible = typeof document !== 'undefined' ? !document.hidden : true;
    let consecutiveErrors = 0;
    let lastSeenCreatedAt = 0;

    const visibleMs = 60000;   // 60s when app is visible
    const hiddenMs = 300000;   // 5m when app is hidden

    const startInterval = (fn) => {
      if (pollInterval) clearInterval(pollInterval);
      const ms = isVisible ? visibleMs : hiddenMs;
      pollInterval = setInterval(fn, ms);
      console.log(`📡 Smart polling running every ${ms / 1000}s (${isVisible ? 'visible' : 'hidden'})`);
    };

    const setupSmartPolling = async () => {
      try {
        // Quick connectivity probe
        const { error: probeError } = await supabase
          .from('restrooms')
          .select('id')
          .limit(1);
        if (probeError) throw probeError;

        setStats((prev) => ({ ...prev, networkStatus: 'CONNECTED' }));

        const poll = async () => {
          try {
            console.log('🔄 Smart polling for restroom updates...');

            // Total count (cheap HEAD request)
            const { count, error: countError } = await supabase
              .from('restrooms')
              .select('*', { count: 'exact', head: true });
            if (countError) throw countError;

            // Latest created_at to detect updates without full reload
            const { data: latestRows, error: latestError } = await supabase
              .from('restrooms')
              .select('created_at')
              .order('created_at', { ascending: false })
              .limit(1);
            if (latestError) throw latestError;

            let shouldReload = false;

            // If count changed, reload
            if (typeof count === 'number' && count !== restrooms.length) {
              console.log(`📊 Count changed: ${restrooms.length} → ${count}`);
              shouldReload = true;
            }

            // If we detect a newer created_at, reload
            if (latestRows && latestRows.length > 0 && latestRows[0].created_at) {
              const latestTs = new Date(latestRows[0].created_at).getTime();
              if (latestTs > lastSeenCreatedAt) {
                if (lastSeenCreatedAt !== 0) {
                  console.log('📝 Newer data detected since last poll');
                  shouldReload = true;
                }
                lastSeenCreatedAt = latestTs;
              }
            }

            if (shouldReload && map && mapLoaded) {
              await loadRestrooms();
            }

            setStats((prev) => ({
              ...prev,
              networkStatus: 'CONNECTED'
            }));

            consecutiveErrors = 0; // reset on success
          } catch (err) {
            consecutiveErrors += 1;
            console.warn(`Polling error (x${consecutiveErrors}):`, err);
            setStats((prev) => ({ ...prev, networkStatus: consecutiveErrors >= 3 ? 'ERROR' : 'RETRY' }));
          }
        };

        // Initial immediate poll, then schedule
        await poll();
        startInterval(poll);

        // Visibility awareness
        const onVis = () => {
          isVisible = !document.hidden;
          // Immediate poll when returning to foreground
          if (isVisible) poll();
          startInterval(poll);
        };
        document.addEventListener('visibilitychange', onVis);

        // Cleanup for listener
        return () => document.removeEventListener('visibilitychange', onVis);
      } catch (e) {
        console.error('Smart polling setup failed:', e);
        setStats((prev) => ({ ...prev, networkStatus: 'ERROR' }));
      }
    };

    if (map && mapLoaded) {
      setupSmartPolling();
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [map, mapLoaded, restrooms.length]);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await initGoogleMaps();
        console.info('✅ Google Maps JS loaded via Loader');
        setupMap();
      } catch (e) {
        console.error('❌ Failed to load Google Maps via Loader', e);
        setLoading(false);
        alert('Failed to load Google Maps. Check your API key, billing, and allowed referrers for your Vercel domain.');
      }
    };

    const setupMap = () => {
      if (mapRef.current && !googleMapRef.current) {
        const mapOptions = {
          // Start neutral; we'll center on user when geolocation resolves
          center: { lat: 37.0902, lng: -95.7129 }, // USA center fallback
          zoom: 16,
          tilt: 45,
          heading: 90,
          mapId: process.env.REACT_APP_GOOGLE_MAPS_MAP_ID,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#242f3e" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#242f3e" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#746855" }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }]
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }]
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }]
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }]
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }]
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }]
            }
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

        // Add click listener for adding new restrooms
        newMap.addListener('click', (event) => {
          // Always allow clicking on map to add restroom
          setAddLocation({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          });

          // Clear any existing temporary markers
          if (window.tempMarker) {
            window.tempMarker.setMap(null);
          }

          // Add temporary marker
          window.tempMarker = new window.google.maps.Marker({
            position: event.latLng,
            map: newMap,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#0dffe7"/>
                  <text x="20" y="25" text-anchor="middle" fill="white" font-size="20" font-weight="bold">+</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 50),
              anchor: new window.google.maps.Point(20, 50)
            },
            title: 'Click to add restroom here'
          });

          // Show the add form modal
          setShowAddForm(true);
        });
      }
    };

    initializeMap();
  }, [showAddForm]);

  // Get user location
  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        setUserLocation(null);
        setUserLocationName('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Got user location:', location);
          setUserLocation(location);

          // Get city name from coordinates
          try {
            const addressInfo = await reverseGeocode(location.lat, location.lng);
            console.log('Reverse geocode result:', addressInfo);

            // Extract city name from address components
            let cityName = 'Unknown Location';
            if (addressInfo.address_components) {
              const cityComponent = addressInfo.address_components.find(
                component => component.types.includes('locality') ||
                           component.types.includes('administrative_area_level_2') ||
                           component.types.includes('administrative_area_level_1')
              );
              if (cityComponent) {
                cityName = cityComponent.long_name;
              }
            }
            setUserLocationName(cityName);
          } catch (error) {
            console.warn('Failed to get city name:', error);
            setUserLocationName('Unknown Location');
          }

          // Center map on user location with higher zoom
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(location);
            googleMapRef.current.setZoom(16);

            // Add user location marker
            new window.google.maps.Marker({
              position: location,
              map: googleMapRef.current,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="10" fill="#4285F4" stroke="white" stroke-width="3"/>
                    <circle cx="15" cy="15" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(30, 30),
                anchor: new window.google.maps.Point(15, 15)
              },
              title: 'Your Location'
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Location access denied';

          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown location error';
              break;
          }

          console.warn('Geolocation failed:', errorMessage);
          // Set userLocation to null so UI shows appropriate message
          setUserLocation(null);
          setUserLocationName(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    };

    // Try to get location as soon as possible
    if (mapsApiLoaded) {
      console.log('🌍 Maps API loaded, requesting geolocation...');
      getUserLocation();
    }
  }, [map, mapsApiLoaded]);

  // Load restrooms and add markers
  useEffect(() => {
    if (map && mapLoaded) {
      loadRestrooms();
    }
  }, [map, mapLoaded]);

  // Load restrooms from Supabase and Google Places
  const loadRestrooms = async () => {
    try {
      setLoading(true);

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Get user location for nearby search
      let supabaseRestrooms = [];
      let googleRestrooms = [];

      if (userLocation) {
        // Load nearby restrooms from both sources
        try {
          // Load from Supabase
          supabaseRestrooms = await restroomService.getNearby(
            userLocation.lat,
            userLocation.lng,
            10000 // 10km radius
          );
          console.log('Loaded restrooms from Supabase:', supabaseRestrooms);
        } catch (error) {
          console.warn('Failed to load from Supabase:', error);
        }

        try {
          // Initialize Google Places service if not already done
          if (!googlePlacesService.service) {
            await googlePlacesService.initialize();
          }

          // Load from Google Places API
          googleRestrooms = await googlePlacesService.findAccessibleRestrooms(
            userLocation.lat,
            userLocation.lng,
            5000 // 5km radius for Google Places
          );
          console.log('Loaded restrooms from Google Places:', googleRestrooms);
        } catch (error) {
          console.warn('Failed to load from Google Places:', error);
        }
      } else {
        // Fallback: load all restrooms from Supabase only (limit for performance)
        try {
          const { data, error } = await restroomService.supabase
            .from('restrooms')
            .select(`
              *,
              reviews (
                id,
                rating
              )
            `)
            .limit(50)
            .order('created_at', { ascending: false });

          if (error) throw error;

          supabaseRestrooms = data.map(restroom => ({
            ...restroom,
            avg_rating: restroom.reviews.length > 0
              ? restroom.reviews.reduce((sum, review) => sum + review.rating, 0) / restroom.reviews.length
              : 0,
            review_count: restroom.reviews.length,
            source: 'supabase'
          }));
        } catch (error) {
          console.warn('Failed to load from Supabase:', error);
        }
      }

      // Combine and deduplicate restrooms
      const combinedRestrooms = [...supabaseRestrooms];

      // Add Google Places restrooms that don't conflict with Supabase ones
      googleRestrooms.forEach(googleRestroom => {
        const isDuplicate = supabaseRestrooms.some(supabaseRestroom => {
          const distance = calculateDistance(
            googleRestroom.lat, googleRestroom.lng,
            supabaseRestroom.lat, supabaseRestroom.lng
          );
          return distance < 50; // Consider duplicates if within 50 meters
        });

        if (!isDuplicate) {
          combinedRestrooms.push({
            ...googleRestroom,
            // Convert Google Places format to our format
            id: `google_${googleRestroom.id}`,
            wheelchair_accessible: googleRestroom.wheelchair_accessible,
            avg_rating: googleRestroom.rating,
            review_count: googleRestroom.user_ratings_total,
            source: 'google_places'
          });
        }
      });

      console.log('Combined restrooms:', combinedRestrooms);

      // Add markers for combined restrooms
      const newMarkers = combinedRestrooms.map(restroom => {
        // Different icons for different sources
        const iconColor = restroom.source === 'google_places' ? '#0dffe7' : '#6B4423';
        const iconEmoji = restroom.source === 'google_places' ? '🏢' : '🚽';

        const marker = new window.google.maps.Marker({
          position: { lat: restroom.lat, lng: restroom.lng },
          map: map,
          title: restroom.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${iconColor};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${iconColor === '#0dffe7' ? '#0aa3c7' : '#4A2F18'};stop-opacity:1" />
                  </linearGradient>
                </defs>
                <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="url(#grad1)"/>
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="20">${iconEmoji}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 50),
            anchor: new window.google.maps.Point(20, 50)
          }
        });

        // Add click listener to show info window
        const sourceLabel = restroom.source === 'google_places' ? 'Google Places' : 'Community Added';
        const sourceColor = restroom.source === 'google_places' ? '#0dffe7' : '#6B4423';

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 15px; min-width: 220px; background: white; border-radius: 8px; font-family: 'Bebas Neue', cursive;">
              <h3 style="margin: 0 0 12px 0; color: #2c1810; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${restroom.name}</h3>
              <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">🚽 Rating: ${restroom.avg_rating ? restroom.avg_rating.toFixed(1) : 'No rating'}/5</p>
              <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">📝 ${restroom.review_count || 0} reviews</p>
              <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">${restroom.wheelchair_accessible ? '♿ Accessible' : '🚫 Not Accessible'}</p>
              <p style="margin: 8px 0; color: ${sourceColor}; font-size: 12px; font-weight: bold;">📍 Source: ${sourceLabel}</p>
              ${restroom.address ? `<p style="margin: 8px 0; color: #666; font-size: 12px;">📍 ${restroom.address}</p>` : ''}
              <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button onclick="window.open('/restroom/${restroom.id}', '_blank')"
                  style="background: linear-gradient(135deg, #6B4423, #4A2F18); color: white; border: 2px solid #0dffe7; border-radius: 8px; padding: 8px 14px; cursor: pointer; font-family: 'Bebas Neue', cursive; font-size: 12px; letter-spacing: 1px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: all 0.3s ease; flex: 1;">
                  View Details
                </button>
                <button onclick="window.openRatingForm('${restroom.id}')"
                  style="background: linear-gradient(135deg, #DAA520, #B8860B); color: white; border: 2px solid #0dffe7; border-radius: 8px; padding: 8px 14px; cursor: pointer; font-family: 'Bebas Neue', cursive; font-size: 12px; letter-spacing: 1px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: all 0.3s ease; flex: 1;">
                  🚽 Rate
                </button>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setSelectedRestroom(restroom);
        });

        return marker;
      });

      markersRef.current = newMarkers;
      setRestrooms(combinedRestrooms);

      // Global function for rating form
      window.openRatingForm = (restroomId) => {
        const restroom = combinedRestrooms.find(r => r.id === restroomId);
        if (restroom) {
          setRatingRestroom(restroom);
          setShowRatingForm(true);
        }
      };

      // Update stats with combined data
      const accessibleCount = combinedRestrooms.filter(r => r.wheelchair_accessible).length;
      const avgRating = combinedRestrooms.length > 0
        ? (combinedRestrooms.reduce((sum, r) => sum + (r.avg_rating || 0), 0) / combinedRestrooms.length).toFixed(1)
        : '0.0';

      setStats({
        totalRestrooms: combinedRestrooms.length,
        averageRating: avgRating,
        recentlyAdded: combinedRestrooms.filter(r => {
          if (!r.created_at) return false; // Google Places data doesn't have created_at
          const createdDate = new Date(r.created_at);
          const today = new Date();
          return createdDate.toDateString() === today.toDateString();
        }).length,
        accessibleCount: accessibleCount,
        onlineUsers: 42, // This could be real-time from Supabase presence
        networkStatus: 'CONNECTED'
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading restrooms:', error);
      setLoading(false);
      // Fallback to mock data if Supabase fails
      loadMockData();
    }
  };

  // Fallback to mock data
  const loadMockData = () => {
    const newMarkers = mockRestrooms.map(restroom => {
      const marker = new window.google.maps.Marker({
        position: { lat: restroom.lat, lng: restroom.lng },
        map: map,
        title: restroom.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6B4423;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4A2F18;stop-opacity:1" />
                </linearGradient>
              </defs>
              <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="url(#grad1)"/>
              <text x="20" y="25" text-anchor="middle" fill="white" font-size="20">🚽</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 15px; min-width: 220px; background: white; border-radius: 8px; font-family: 'Bebas Neue', cursive;">
            <h3 style="margin: 0 0 12px 0; color: #2c1810; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${restroom.name}</h3>
            <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">🚽 Rating: ${restroom.rating}/5</p>
            <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">📝 ${restroom.reviews} reviews</p>
            <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">${restroom.accessible ? '♿ Accessible' : '🚫 Not Accessible'}</p>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button onclick="window.openRatingForm('${restroom.id}')"
                style="background: linear-gradient(135deg, #DAA520, #B8860B); color: white; border: 2px solid #0dffe7; border-radius: 8px; padding: 8px 14px; cursor: pointer; font-family: 'Bebas Neue', cursive; font-size: 12px; letter-spacing: 1px; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: all 0.3s ease; width: 100%;">
                🚽 Rate This Restroom
              </button>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelectedRestroom(restroom);
      });

      return marker;
    });

    markersRef.current = newMarkers;
    setRestrooms(mockRestrooms);

    // Global function for rating form (mock data)
    window.openRatingForm = (restroomId) => {
      const restroom = mockRestrooms.find(r => r.id === restroomId);
      if (restroom) {
        setRatingRestroom(restroom);
        setShowRatingForm(true);
      }
    };

    setStats({
      totalRestrooms: mockRestrooms.length,
      averageRating: (mockRestrooms.reduce((sum, r) => sum + r.rating, 0) / mockRestrooms.length).toFixed(1),
      recentlyAdded: 2,
      accessibleCount: mockRestrooms.filter(r => r.accessible).length,
      onlineUsers: 42,
      networkStatus: 'CONNECTED'
    });
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // Show all markers if search is empty
      markersRef.current.forEach(marker => marker.setVisible(true));
      return;
    }

    try {
      // Search using Supabase
      let searchResults = [];
      if (userLocation) {
        searchResults = await restroomService.search(
          query,
          userLocation.lat,
          userLocation.lng,
          { radius: 10000 }
        );
      } else {
        // Fallback search without location
        searchResults = await restroomService.search(query);
      }

      // Update marker visibility based on search results
      markersRef.current.forEach((marker, index) => {
        const restroom = restrooms[index];
        const isVisible = searchResults.some(result => result.id === restroom.id) ||
                         restroom.name.toLowerCase().includes(query.toLowerCase());
        marker.setVisible(isVisible);
      });

      console.log('Search results:', searchResults);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local filtering
      markersRef.current.forEach((marker, index) => {
        const restroom = restrooms[index];
        const isVisible = restroom.name.toLowerCase().includes(query.toLowerCase());
        marker.setVisible(isVisible);
      });
    }
  };

  const handleAddRestroom = async (data) => {
    try {
      console.log('Adding restroom:', data);

      // Check authentication first
      if (!isAuthenticated) {
        alert('Please sign in to add restrooms!');
        return;
      }

      // Validate required fields
      if (!data.name || !data.lat || !data.lng) {
        alert('Please provide all required information');
        return;
      }

      // Create restroom in Supabase
      const newRestroom = await restroomService.createWithLocation({
        name: data.name,
        lat: data.lat,
        lng: data.lng,
        wheelchair_accessible: data.accessible || false,
        description: data.description || '',
        // Add default values
        baby_changing: false,
        gender_neutral: false,
        requires_fee: false,

        verified: false
      });

      // Normalize for frontend (DB may return lon instead of lng)
      const created = { ...newRestroom, lng: newRestroom.lng ?? newRestroom.lon };

      console.log('Restroom created successfully:', created);

      // Close form and reset
      setShowAddForm(false);
      setAddLocation(null);

      // Clear temporary marker
      if (window.tempMarker) {
        window.tempMarker.setMap(null);
        window.tempMarker = null;
      }

      // Add new marker to map
      if (map && created) {
        const marker = new window.google.maps.Marker({
          position: { lat: created.lat, lng: created.lng },
          map: map,
          title: created.name,
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#6B4423;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#4A2F18;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="url(#grad1)"/>
                <text x="20" y="25" text-anchor="middle" fill="white" font-size="20">🚽</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 50),
            anchor: new window.google.maps.Point(20, 50)
          }
        });

        // Add click listener for the new marker
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 15px; min-width: 220px; background: white; border-radius: 8px; font-family: 'Bebas Neue', cursive;">
              <h3 style="margin: 0 0 12px 0; color: #2c1810; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${created.name}</h3>
              <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">⭐ Rating: New location</p>
              <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">📝 0 reviews</p>
              <p style="margin: 8px 0; color: #4a2f18; font-size: 14px; font-weight: 600;">${created.wheelchair_accessible ? '♿ Accessible' : '🚫 Not Accessible'}</p>
              <p style="margin: 8px 0; color: #0dffe7; font-size: 12px; font-weight: bold;">✨ Just Added!</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);

        // Update restrooms list
        setRestrooms(prev => [...prev, created]);

        // Update stats
        setStats(prev => ({
          ...prev,
          totalRestrooms: prev.totalRestrooms + 1,
          recentlyAdded: prev.recentlyAdded + 1
        }));
      }

      alert('Restroom added successfully!');
    } catch (error) {
      console.error('Error adding restroom:', error);
      let message = 'Unknown error';

      if (error?.message) {
        message = error.message;
      } else if (error?.error_description) {
        message = error.error_description;
      } else if (error?.code) {
        message = error.code;
      }

      // Provide specific feedback for common authentication errors
      if (message.includes('not authenticated') || message.includes('logged in')) {
        alert('Please sign in to add restrooms!');
      } else {
        alert(`Failed to add restroom: ${message}`);
      }
    }
  };

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
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search restrooms..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            <div className="connection-status">
              <FaWifi className={`status-icon ${stats.networkStatus.toLowerCase()}`} />
              <span className="status-text">DB: {stats.networkStatus}</span>
            </div>
            <div className="location-display" style={{ marginLeft: 'auto' }}>
              <FaMapMarkerAlt className="location-icon" />
              <div className="location-info">
                {userLocation ? (
                  <>
                    <span className="location-text">Current Location</span>
                    <span className="coordinates">
                      {userLocationName || 'Getting city name...'}
                    </span>
                  </>
                ) : mapsApiLoaded ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="location-text">Location unavailable</span>
                    <button
                      onClick={() => {
                        const getUserLocation = () => {
                          if (!navigator.geolocation) {
                            setUserLocationName('Geolocation not supported');
                            return;
                          }
                          setUserLocationName('Getting your location...');
                          navigator.geolocation.getCurrentPosition(
                            async (position) => {
                              const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                              setUserLocation(location);
                              try {
                                const addressInfo = await reverseGeocode(location.lat, location.lng);
                                const cityComponent = addressInfo.address_components?.find(
                                  component => component.types.includes('locality') ||
                                             component.types.includes('administrative_area_level_2') ||
                                             component.types.includes('administrative_area_level_1')
                                );
                                setUserLocationName(cityComponent?.long_name || 'Location found');
                              } catch (error) {
                                setUserLocationName('Location found');
                              }
                              if (googleMapRef.current) {
                                googleMapRef.current.setCenter(location);
                                googleMapRef.current.setZoom(16);
                              }
                            },
                            (error) => {
                              setUserLocationName('Location access denied');
                            },
                            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
                          );
                        };
                        getUserLocation();
                      }}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        background: 'var(--gold)',
                        color: 'var(--dark-brown)',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginTop: '2px'
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <span className="location-text">Getting location...</span>
                )}
              </div>
            </div>
          </div>
          <motion.button
            className={`add-restroom-btn ${showAddForm ? 'active' : ''} ${!isAuthenticated ? 'disabled' : ''}`}
            onClick={() => {
              if (!isAuthenticated) {
                // Navigate to home page with login flag to trigger modal
                window.location.href = '/?login=true';
                return;
              }

              if (showAddForm) {
                // Close form and clear temp marker
                setShowAddForm(false);
                setAddLocation(null);
                if (window.tempMarker) {
                  window.tempMarker.setMap(null);
                  window.tempMarker = null;
                }
              } else {
                // Just show instruction - clicking map will open form
                alert('Click anywhere on the map to add a new restroom!');
              }
            }}
            whileHover={{ scale: isAuthenticated ? 1.05 : 1 }}
            whileTap={{ scale: isAuthenticated ? 0.95 : 1 }}
            disabled={!isAuthenticated}
          >
            <FaPlus />
            <span>{showAddForm ? 'Cancel' : isAuthenticated ? 'Add Restroom' : 'Sign In to Add'}</span>
          </motion.button>
        </motion.div>

        {/* Real-time Status Badge - Top Left */}
        <motion.div
          className={`realtime-badge ${stats.networkStatus.toLowerCase()}`}
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FaWifi className="realtime-icon" />
          <span className="realtime-text">
            {stats.networkStatus === 'REALTIME' ? 'LIVE' : stats.networkStatus}
          </span>
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
              <span className="stat-number">{stats.onlineUsers}</span>
              <span className="stat-label">Online</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Restroom Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundImage: `url(${woodBg})` }}
            >
              <div className="modal-header">
                <FaPlus className="modal-icon" />
                <span>Add New Restroom</span>
                <button
                  className="close-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {addLocation ? (
                  <div className="location-confirmation">
                    <p style={{ color: 'var(--psychedelic-lime)', fontWeight: 'bold', marginBottom: '1rem' }}>
                      ✓ Location Selected: {addLocation.lat.toFixed(6)}, {addLocation.lng.toFixed(6)}
                    </p>
                    <p className="modal-instruction">
                      Fill out the details below to add this restroom:
                    </p>
                  </div>
                ) : (
                  <p className="modal-instruction">
                    Please click on the map to select a location first.
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
                    placeholder="Restroom name..."
                    required
                    className="form-input"
                  />
                  <textarea
                    name="description"
                    placeholder="Description (optional)..."
                    className="form-input"
                    rows="3"
                  />
                  <label className="form-checkbox">
                    <input type="checkbox" name="accessible" />
                    <span>Wheelchair Accessible</span>
                  </label>
                  <button
                    type="submit"
                    disabled={!addLocation}
                    className={`form-submit ${addLocation ? 'enabled' : 'disabled'}`}
                  >
                    {addLocation ? 'Add Restroom' : 'Click on map first'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Form Modal */}
      <AnimatePresence>
        {showRatingForm && ratingRestroom && (
          <RatingForm
            restroom={ratingRestroom}
            onSubmit={async (ratingData) => {
              try {
                // Submit rating to backend
                console.log('Submitting rating:', ratingData);
                // You can add actual API call here
                setShowRatingForm(false);
                setRatingRestroom(null);
                // Optionally refresh restroom data
              } catch (error) {
                console.error('Error submitting rating:', error);
              }
            }}
            onCancel={() => {
              setShowRatingForm(false);
              setRatingRestroom(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Instructions Overlay */}
      {showInstructions && !loading && (
        <motion.div
          className="instructions-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="instructions-content"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            style={{ backgroundImage: `url(${woodBg})` }}
          >
            <h3>Welcome to Püper Map! 🚽</h3>
            <div className="instructions-list">
              <p>🗺️ <strong>Browse:</strong> Explore restrooms from our community and Google Places</p>
              <p>🔍 <strong>Search:</strong> Use the search box to find specific locations</p>
              <p>➕ <strong>Add Restroom:</strong> Click anywhere on the map to add a new restroom</p>
              <p>📊 <strong>Live Updates:</strong> See new restrooms appear instantly with real-time sync</p>
              <p>🔗 <strong>Connection:</strong> Check the status indicator in the search panel</p>
            </div>
            <button
              className="instructions-close"
              onClick={() => setShowInstructions(false)}
            >
              Got it! Let's explore
            </button>
          </motion.div>
        </motion.div>
      )}

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
            <span className="loading-text">INITIALIZING MAP...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 1000); // Return distance in meters
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

export default MapPage;