import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, location });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSearch({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <motion.div 
      className="search-bar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for restrooms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="location-input-group">
          <FaMapMarkerAlt className="location-icon" />
          <input
            type="text"
            placeholder="Enter location or address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="location-input"
          />
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="current-location-btn"
            title="Use current location"
          >
            📍
          </button>
        </div>
        
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
    </motion.div>
  );
};

export default SearchBar;
