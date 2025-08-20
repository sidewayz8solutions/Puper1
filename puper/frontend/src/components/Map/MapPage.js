import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRestrooms } from '../hooks/useRestrooms';
import MapboxView from '../components/Map/MapboxView';
import RestroomList from '../components/Restroom/RestroomList';
import SearchBar from '../components/Search/SearchBar';
import FilterBar from '../components/Search/FilterBar';
import RestroomDetail from '../components/Restroom/RestroomDetail';
import AddRestroomForm from '../components/Restroom/AddRestroomForm';
import Loading from '../components/Common/Loading';
import './MapPage.css';

const MapPage = () => {
  const { location, loading: locationLoading } = useGeolocation();
  const [filters, setFilters] = useState({});
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [mapClickLocation, setMapClickLocation] = useState(null);
  
  const { restrooms, loading, refetch } = useRestrooms(
    location?.lat,
    location?.lon,
    filters
  );

  // Check URL params for add mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setShowAddForm(true);
    }
  }, []);

  const handleSearch = (searchParams) => {
    setFilters({ ...filters, ...searchParams });
    refetch();
  };

  const handleMarkerClick = (restroom) => {
    setSelectedRestroom(restroom);
    setShowDetail(true);
  };

  const handleMapClick = (event) => {
    if (showAddForm && event.lngLat) {
      setMapClickLocation({
        lat: event.lngLat.lat,
        lon: event.lngLat.lng
      });
    }
  };

  const handleAddRestroom = async (restroomData) => {
    try {
      // Add restroom API call
      await createRestroom(restroomData);
      setShowAddForm(false);
      refetch();
      toast.success('Restroom added successfully!');
    } catch (error) {
      toast.error('Failed to add restroom');
    }
  };

  if (locationLoading) {
    return <Loading message="Getting your location..." />;
  }

  return (
    <motion.div 
      className="map-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="map-header">
        <SearchBar onSearch={handleSearch} />
        <FilterBar filters={filters} onChange={setFilters} />
      </div>
      
      <div className="map-container">
        <div className="map-main">
          <MapboxView
            center={location ? [location.lat, location.lon] : [40.7128, -74.0060]}
            restrooms={restrooms}
            onMarkerClick={handleMarkerClick}
            onMapClick={handleMapClick}
            showDirections={showDirections}
            destination={selectedRestroom}
          />
        </div>
        
        <div className="map-sidebar">
          <RestroomList
            restrooms={restrooms}
            loading={loading}
            onSelect={handleMarkerClick}
          />
        </div>
        
        {showDetail && selectedRestroom && (
          <RestroomDetail
            restroom={selectedRestroom}
            onClose={() => setShowDetail(false)}
            onGetDirections={() => setShowDirections(true)}
          />
        )}

        {showAddForm && (
          <AddRestroomForm
            location={mapClickLocation || location}
            onSubmit={handleAddRestroom}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="fab"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddForm(true)}
      >
        <FaPlus />
      </motion.button>
    </motion.div>
  );
};

export default MapPage;