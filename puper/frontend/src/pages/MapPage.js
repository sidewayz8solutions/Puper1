import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { FaPlus, FaTimes, FaList, FaMap } from 'react-icons/fa';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRestrooms } from '../hooks/useRestrooms';
import GoogleMapView from '../components/Map/GoogleMapView';
import RestroomList from '../components/Restroom/RestroomList';
import SearchBar from '../components/Search/SearchBar';
import FilterBar from '../components/Search/FilterBar';
import RestroomDetail from '../components/Restroom/RestroomDetail';
import AddRestroomForm from '../components/Restroom/AddRestroomForm';
import Loading from '../components/Common/Loading';
import Button from '../components/Common/Button';
import toast from 'react-hot-toast';
import './MapPage.css';

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const [filters, setFilters] = useState({});
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddForm, setShowAddForm] = useState(searchParams.get('add') === 'true');
  const [addLocation, setAddLocation] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [searchQuery, setSearchQuery] = useState('');

  const { restrooms, loading, refetch } = useRestrooms(
    location?.lat,
    location?.lon,
    { ...filters, query: searchQuery }
  );

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
      className="map-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header Controls */}
      <div className="map-header">
        <SearchBar onSearch={handleSearch} />
        <FilterBar filters={filters} onChange={setFilters} />

        <div className="map-controls">
          <div className="view-toggle">
            <Button
              variant={viewMode === 'map' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('map')}
              size="small"
            >
              <FaMap /> Map
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('list')}
              size="small"
            >
              <FaList /> List
            </Button>
          </div>

          <Button
            variant={showAddForm ? 'danger' : 'primary'}
            onClick={() => setShowAddForm(!showAddForm)}
            className="add-restroom-btn"
          >
            {showAddForm ? <FaTimes /> : <FaPlus />}
            {showAddForm ? 'Cancel' : 'Add Restroom'}
          </Button>
        </div>
      </div>

      {/* Add Restroom Instructions */}
      {showAddForm && (
        <motion.div
          className="add-instructions"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>
            {addLocation
              ? 'Location selected! Fill out the form below to add the restroom.'
              : 'Click on the map where the restroom is located, then fill out the form.'
            }
          </p>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="map-content">
        {viewMode === 'map' ? (
          <div className="map-container">
            <GoogleMapView
              center={location ? [location.lat, location.lon] : [40.7128, -74.0060]}
              restrooms={restrooms}
              onMarkerClick={handleMarkerClick}
              onMapClick={handleMapClick}
              addMode={showAddForm}
              addLocation={addLocation}
            />
          </div>
        ) : (
          <div className="list-container">
            <RestroomList
              restrooms={restrooms}
              loading={loading}
              onSelect={handleMarkerClick}
            />
          </div>
        )}
      </div>

      {/* Modals and Overlays */}
      <AnimatePresence>
        {showDetail && selectedRestroom && (
          <RestroomDetail
            restroom={selectedRestroom}
            onClose={() => setShowDetail(false)}
          />
        )}

        {showAddForm && (
          <motion.div
            className="add-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AddRestroomForm
              location={addLocation || location}
              onSuccess={handleAddSuccess}
              onClose={handleAddCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MapPage;
