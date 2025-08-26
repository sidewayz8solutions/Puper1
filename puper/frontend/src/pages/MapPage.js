import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FaPlus, FaTimes, FaSearch, FaFilter, FaUsers,
  FaMapMarkerAlt, FaStar, FaClock, FaWifi, FaBolt,
  FaChartLine, FaGlobe, FaExpand, FaCompass
} from 'react-icons/fa';
import woodBg from '../assets/images/wood.png';
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
          </div>
          <motion.button
            className={`add-restroom-btn ${showAddForm ? 'active' : ''}`}
            onClick={() => setShowAddForm(!showAddForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus />
            <span>Add Restroom</span>
          </motion.button>
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
              <FaStar />
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
                <p className="modal-instruction">
                  Click on the map to set location, then fill out the details below.
                </p>
                {addLocation && (
                  <p className="location-confirmation">
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
                }} className="restroom-form">
                  <input
                    type="text"
                    name="name"
                    placeholder="Restroom name..."
                    required
                    className="form-input"
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