import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  FaPlus, FaTimes, FaList, FaMap, FaSearch, FaFilter, FaUsers,
  FaMapMarkerAlt, FaStar, FaClock, FaWifi, FaBolt, FaRocket,
  FaChartLine, FaGlobe, FaLayerGroup, FaExpand
} from 'react-icons/fa';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRealtimeRestrooms } from '../hooks/useRealtimeRestrooms';
import AdvancedGoogleMapView from '../components/Map/AdvancedGoogleMapView';
import AdvancedSearchPanel from '../components/Map/AdvancedSearchPanel';
import RestroomList from '../components/Restroom/RestroomList';
import RestroomDetail from '../components/Restroom/RestroomDetail';
import AddRestroomForm from '../components/Restroom/AddRestroomForm';
import Loading from '../components/Common/Loading';
import toast from 'react-hot-toast';
import './FuturisticMapPage.css';

const FuturisticMapPage = () => {
  const [searchParams] = useSearchParams();
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const [filters, setFilters] = useState({});
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddForm, setShowAddForm] = useState(searchParams.get('add') === 'true');
  const [addLocation, setAddLocation] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [isCommandMode, setIsCommandMode] = useState(false);

  // Refs for animations
  const mapContainerRef = useRef(null);
  const statsRef = useRef(null);

  // Use the advanced realtime hook
  const {
    restrooms,
    loading,
    isSubscribed,
    findNearbyRestrooms,
    addRestroomOptimistic
  } = useRealtimeRestrooms();

  // Handle URL parameter for adding restroom
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
    }
  }, [searchParams]);

  const handleSearch = (searchParams) => {
    setSearchQuery(searchParams.query || '');
    setFilters({ ...filters, ...searchParams });
    refetch();
  };

  const handleMarkerClick = (restroom) => {
    setSelectedRestroom(restroom);
    setShowDetail(true);
  };

  const handleMapClick = (event) => {
    if (showAddForm && event.lngLat) {
      setAddLocation({
        lat: event.lngLat.lat,
        lon: event.lngLat.lng
      });
      toast.success('Click location set! Fill out the form below.');
    }
  };

  const handleAddSuccess = (newRestroom) => {
    setShowAddForm(false);
    setAddLocation(null);
    refetch();
    toast.success('Restroom added successfully!');

    // Show the new restroom details
    setSelectedRestroom(newRestroom);
    setShowDetail(true);
  };

  const handleAddCancel = () => {
    setShowAddForm(false);
    setAddLocation(null);
    setIsCommandMode(false);
  };

  // Real-time stats calculation
  const stats = {
    totalRestrooms: restrooms.length,
    averageRating: restrooms.length > 0
      ? (restrooms.reduce((sum, r) => sum + (r.avg_rating || 0), 0) / restrooms.length).toFixed(1)
      : '0.0',
    recentlyAdded: restrooms.filter(r =>
      new Date(r.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    accessibleCount: restrooms.filter(r =>
      r.accessibility_features?.wheelchair_accessible
    ).length,
    onlineUsers: 42, // Mock data - would come from realtime presence
    networkStatus: isSubscribed ? 'CONNECTED' : 'CONNECTING'
  };

  // Enhanced handlers for futuristic interface
  const handleAdvancedSearch = (query, lat, lon, filters) => {
    setSearchQuery(query);
    setFilters(filters);
    if (lat && lon) {
      findNearbyRestrooms(lat, lon, filters.radius || 5000);
    }
  };

  const handleRadiusChange = (radius) => {
    if (location) {
      findNearbyRestrooms(location.lat, location.lon, radius * 1000);
    }
  };

  const toggleCommandMode = () => {
    setIsCommandMode(!isCommandMode);
  };

  const toggleSearchPanel = () => {
    setShowSearchPanel(!showSearchPanel);
  };

  const toggleStats = () => {
    setShowStats(!showStats);
  };

  if (locationLoading) {
    return <Loading message="Getting your location..." />;
  }

  if (locationError) {
    return (
      <div className="map-page error-state">
        <div className="error-message">
          <h3>Location Access Required</h3>
          <p>Please enable location access to find nearby restrooms.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`futuristic-map-page ${isCommandMode ? 'command-mode' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Futuristic Command Header */}
      <motion.div
        className="command-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="header-left">
          <div className="logo-section">
            <FaRocket className="command-icon" />
            <span className="command-title">PÜPER COMMAND CENTER</span>
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
              <span className="stat-label">RECENT</span>
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
            className="control-btn"
            onClick={toggleSearchPanel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSearch />
          </motion.button>
          <motion.button
            className="control-btn"
            onClick={toggleStats}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaChartLine />
          </motion.button>
          <motion.button
            className={`control-btn add-btn ${isCommandMode ? 'active' : ''}`}
            onClick={() => setShowAddForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="command-content" ref={mapContainerRef}>
        {/* Advanced Search Panel */}
        <AnimatePresence>
          {showSearchPanel && (
            <motion.div
              className="floating-search-panel"
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AdvancedSearchPanel
                onSearch={handleAdvancedSearch}
                onLocationSearch={(query) => console.log('Location search:', query)}
                onFiltersChange={handleFilterChange}
                onRadiusChange={handleRadiusChange}
                initialRadius={5}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Map View */}
        <div className="holographic-map-container">
          <AdvancedGoogleMapView
            center={location}
            restrooms={restrooms}
            onMarkerClick={handleMarkerClick}
            onMapClick={handleMapClick}
            addMode={showAddForm}
            addLocation={addLocation}
            userLocation={location}
          />

          {/* Holographic Overlay */}
          <div className="holographic-overlay">
            <div className="scan-lines"></div>
            <div className="grid-overlay"></div>
          </div>
        </div>

        {/* Floating Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              className="floating-stats-panel"
              initial={{ y: 400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 400, opacity: 0 }}
              transition={{ duration: 0.5 }}
              ref={statsRef}
            >
              <div className="stats-header">
                <FaChartLine className="stats-icon" />
                <span>REAL-TIME ANALYTICS</span>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalRestrooms}</div>
                  <div className="stat-description">Total Locations</div>
                  <div className="stat-trend">+{stats.recentlyAdded} today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.averageRating}</div>
                  <div className="stat-description">Network Rating</div>
                  <div className="stat-trend">Quality Index</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.accessibleCount}</div>
                  <div className="stat-description">Accessible</div>
                  <div className="stat-trend">Barrier-Free</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.onlineUsers}</div>
                  <div className="stat-description">Active Users</div>
                  <div className="stat-trend">Live Network</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Futuristic Modals and Overlays */}
      <AnimatePresence>
        {showDetail && selectedRestroom && (
          <motion.div
            className="holographic-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="holographic-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RestroomDetail
                restroom={selectedRestroom}
                onClose={() => setShowDetail(false)}
              />
            </motion.div>
          </motion.div>
        )}

        {showAddForm && (
          <motion.div
            className="command-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="command-modal"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="modal-header">
                <FaBolt className="modal-icon" />
                <span>ADD NEW LOCATION TO NETWORK</span>
                <button
                  className="close-btn"
                  onClick={handleAddCancel}
                >
                  <FaTimes />
                </button>
              </div>
              <AddRestroomForm
                location={addLocation || location}
                onSuccess={handleRestroomAdded}
                onClose={handleAddCancel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {(loading || locationLoading) && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-content">
            <div className="holographic-loader">
              <FaGlobe className="spinning-globe" />
            </div>
            <span className="loading-text">
              {locationLoading ? 'ACQUIRING COORDINATES...' : 'SCANNING NETWORK...'}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FuturisticMapPage;
