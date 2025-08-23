import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FaPlus, FaTimes, FaSearch, FaFilter, FaUsers,
  FaMapMarkerAlt, FaStar, FaClock, FaWifi, FaBolt,
  FaChartLine, FaGlobe, FaExpand, FaCompass
} from 'react-icons/fa';
import './MapPage.css';

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  
  // State management
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [restrooms, setRestrooms] = useState([]);
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [showAddForm, setShowAddForm] = useState(searchParams.get('add') === 'true');
  const [addLocation, setAddLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);
  
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

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !window.google.maps) {
        // Load Google Maps Script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,marker`;
        script.async = true;
        script.defer = true;
        script.onload = () => setupMap();
        document.head.appendChild(script);
      } else {
        setupMap();
      }
    };

    const setupMap = () => {
      if (mapRef.current && !googleMapRef.current) {
        const mapOptions = {
          center: { lat: 29.9511, lng: -90.0715 }, // New Orleans
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
          if (showAddForm) {
            setAddLocation({
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            });
            
            // Add temporary marker
            new window.google.maps.Marker({
              position: event.latLng,
              map: newMap,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#00ff41"/>
                    <text x="20" y="25" text-anchor="middle" fill="white" font-size="20" font-weight="bold">+</text>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(40, 50),
                anchor: new window.google.maps.Point(20, 50)
              }
            });
          }
        });
      }
    };

    initializeMap();
  }, [showAddForm]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Center map on user location
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(location);
            
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
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    }
  }, [map]);

  // Load restrooms and add markers
  useEffect(() => {
    if (map && mapLoaded) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add markers for restrooms
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

        // Add click listener to show info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #6B4423;">${restroom.name}</h3>
              <p style="margin: 5px 0;">⭐ Rating: ${restroom.rating}/5</p>
              <p style="margin: 5px 0;">📝 ${restroom.reviews} reviews</p>
              <p style="margin: 5px 0;">${restroom.accessible ? '♿ Accessible' : '🚫 Not Accessible'}</p>
              <button onclick="window.open('/restroom/${restroom.id}', '_blank')" 
                style="background: #6B4423; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                View Details
              </button>
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
      
      // Update stats
      setStats({
        totalRestrooms: mockRestrooms.length,
        averageRating: (mockRestrooms.reduce((sum, r) => sum + r.rating, 0) / mockRestrooms.length).toFixed(1),
        recentlyAdded: 2,
        accessibleCount: mockRestrooms.filter(r => r.accessible).length,
        onlineUsers: 42,
        networkStatus: 'CONNECTED'
      });
      
      setLoading(false);
    }
  }, [map, mapLoaded]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic here
    // Filter restrooms based on query
    const filtered = mockRestrooms.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Update markers visibility
    markersRef.current.forEach((marker, index) => {
      marker.setVisible(
        query === '' || filtered.includes(mockRestrooms[index])
      );
    });
  };

  const handleAddRestroom = (data) => {
    // Here you would send data to your backend
    console.log('Adding restroom:', data);
    setShowAddForm(false);
    setAddLocation(null);
    
    // Add new marker
    if (map && data.lat && data.lng) {
      const marker = new window.google.maps.Marker({
        position: { lat: data.lat, lng: data.lng },
        map: map,
        title: data.name,
        animation: window.google.maps.Animation.DROP
      });
      markersRef.current.push(marker);
    }
  };

  return (
    <motion.div
      className="map-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="command-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="header-left">
          <div className="logo-section">
            <FaCompass className="command-icon" />
            <span className="command-title">PÜPER MAP</span>
          </div>
          <div className="network-status">
            <div className={`status-indicator ${stats.networkStatus.toLowerCase()}`}>
              <FaWifi />
            </div>
            <span className="status-text">{stats.networkStatus}</span>
          </div>
        </div>

        <div className="header-center">
          <div className="real-time-stats">
            <div className="stat-item">
              <FaMapMarkerAlt className="stat-icon" />
              <span className="stat-value">{stats.totalRestrooms}</span>
              <span className="stat-label">LOCATIONS</span>
            </div>
            <div className="stat-item">
              <FaStar className="stat-icon" />
              <span className="stat-value">{stats.averageRating}</span>
              <span className="stat-label">AVG RATING</span>
            </div>
            <div className="stat-item">
              <FaClock className="stat-icon" />
              <span className="stat-value">{stats.recentlyAdded}</span>
              <span className="stat-label">NEW TODAY</span>
            </div>
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <span className="stat-value">{stats.onlineUsers}</span>
              <span className="stat-label">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <motion.button
            className={`control-btn add-btn ${showAddForm ? 'active' : ''}`}
            onClick={() => setShowAddForm(!showAddForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Map Container */}
      <div className="command-content">
        <div className="holographic-map-container">
          <div 
            ref={mapRef} 
            className="map-container"
            style={{ width: '100%', height: 'calc(100vh - 80px)' }}
          />
          
          {/* Holographic Overlay Effects */}
          <div className="holographic-overlay">
            <div className="scan-lines"></div>
            <div className="grid-overlay"></div>
          </div>
        </div>

        {/* Search Bar Overlay */}
        <motion.div
          className="floating-search-panel"
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            zIndex: 100,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem',
            borderRadius: '20px',
            border: '2px solid #8a2be2',
            boxShadow: '0 0 30px rgba(138, 43, 226, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FaSearch style={{ color: '#00ffff', fontSize: '1.2rem' }} />
            <input
              type="text"
              placeholder="Search for restrooms..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                width: '300px'
              }}
            />
          </div>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          className="floating-stats-panel"
          initial={{ y: 400, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="stats-header">
            <FaChartLine className="stats-icon" />
            <span>LIVE STATISTICS</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalRestrooms}</div>
              <div className="stat-description">Total Locations</div>
              <div className="stat-trend">+{stats.recentlyAdded} today</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.averageRating}</div>
              <div className="stat-description">Average Rating</div>
              <div className="stat-trend">Quality Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.accessibleCount}</div>
              <div className="stat-description">Accessible</div>
              <div className="stat-trend">♿ Enabled</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.onlineUsers}</div>
              <div className="stat-description">Active Users</div>
              <div className="stat-trend">Live Now</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Restroom Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="command-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="command-modal"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <FaBolt className="modal-icon" />
                <span>ADD NEW RESTROOM</span>
                <button
                  className="close-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div style={{ padding: '2rem' }}>
                <p style={{ color: '#00ffff', marginBottom: '1rem' }}>
                  Click on the map to set location, then fill out the details below.
                </p>
                {addLocation && (
                  <p style={{ color: '#00ff41', marginBottom: '1rem' }}>
                    ✓ Location set: {addLocation.lat.toFixed(6)}, {addLocation.lng.toFixed(6)}
                  </p>
                )}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleAddRestroom({
                    name: formData.get('name'),
                    lat: addLocation?.lat,
                    lng: addLocation?.lng,
                    accessible: formData.get('accessible') === 'on'
                  });
                }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Restroom name..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: 'white'
                    }}
                  />
                  <label style={{ display: 'block', marginBottom: '1rem', color: 'white' }}>
                    <input type="checkbox" name="accessible" style={{ marginRight: '0.5rem' }} />
                    Wheelchair Accessible
                  </label>
                  <button
                    type="submit"
                    disabled={!addLocation}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: addLocation ? 'linear-gradient(135deg, #00ff41, #00ff91)' : '#666',
                      border: 'none',
                      borderRadius: '10px',
                      color: addLocation ? '#000' : '#999',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      cursor: addLocation ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {addLocation ? 'Add Restroom' : 'Click on map first'}
                  </button>
                </form>
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
            <span className="loading-text">INITIALIZING MAP...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MapPage;