import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRestrooms } from '../hooks/useRestrooms';
import MapView from '../components/Map/MapView';
import RestroomList from '../components/Restroom/RestroomList';
import SearchBar from '../components/Search/SearchBar';
import FilterBar from '../components/Search/FilterBar';
import RestroomDetail from '../components/Restroom/RestroomDetail';
import Loading from '../components/Common/Loading';
import 'leaflet/dist/leaflet.css';

const MapPage = () => {
  const { location, loading: locationLoading } = useGeolocation();
  const [filters, setFilters] = useState({});
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const { restrooms, loading, refetch } = useRestrooms(
    location?.lat,
    location?.lon,
    filters
  );

  const handleSearch = (searchParams) => {
    setFilters({ ...filters, ...searchParams });
    refetch();
  };

  const handleMarkerClick = (restroom) => {
    setSelectedRestroom(restroom);
    setShowDetail(true);
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
      <SearchBar onSearch={handleSearch} />
      <FilterBar filters={filters} onChange={setFilters} />
      
      <div className="map-container">
        <MapView
          center={location ? [location.lat, location.lon] : [40.7128, -74.0060]}
          restrooms={restrooms}
          onMarkerClick={handleMarkerClick}
        />
        
        <RestroomList
          restrooms={restrooms}
          loading={loading}
          onSelect={handleMarkerClick}
        />
        
        {showDetail && selectedRestroom && (
          <RestroomDetail
            restroom={selectedRestroom}
            onClose={() => setShowDetail(false)}
          />
        )}
      </div>
    </motion.div>
  );
};

export default MapPage;
