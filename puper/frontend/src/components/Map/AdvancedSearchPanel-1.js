import React, { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaWheelchair, FaBaby, FaTransgenderAlt, FaDollarSign, FaFilter } from 'react-icons/fa';
import './AdvancedSearchPanel.css';

const AdvancedSearchPanel = ({ 
  onSearch, 
  onLocationSearch, 
  onFiltersChange, 
  onRadiusChange,
  initialRadius = 5 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [radius, setRadius] = useState(initialRadius);
  const [filters, setFilters] = useState({
    wheelchair: false,
    babyChanging: false,
    genderNeutral: false,
    free: false
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  // Handle location input
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    onLocationSearch?.(value);
  };

  // Handle filter changes
  const handleFilterChange = (filterName) => {
    const newFilters = {
      ...filters,
      [filterName]: !filters[filterName]
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Handle radius change
  const handleRadiusChange = (e) => {
    const value = parseInt(e.target.value);
    setRadius(value);
    onRadiusChange?.(value);
  };

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={`search-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="search-header">
        <h2>Find Restrooms Near You</h2>
        <button 
          className="expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <FaFilter />
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      <div className="search-controls">
        {/* Main Search Input */}
        <div className="search-input-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search for restrooms..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Location Search Input */}
        <div className="search-input-group">
          <FaMapMarkerAlt className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Enter location or address"
            value={locationQuery}
            onChange={handleLocationChange}
          />
        </div>
      </div>

      {/* Expandable Filters Section */}
      <div className="filters-section">
        <div className="filter-chips">
          <label className={`filter-chip ${filters.wheelchair ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={filters.wheelchair}
              onChange={() => handleFilterChange('wheelchair')}
            />
            <FaWheelchair />
            <span>Wheelchair Accessible</span>
          </label>

          <label className={`filter-chip ${filters.babyChanging ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={filters.babyChanging}
              onChange={() => handleFilterChange('babyChanging')}
            />
            <FaBaby />
            <span>Baby Changing</span>
          </label>

          <label className={`filter-chip ${filters.genderNeutral ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={filters.genderNeutral}
              onChange={() => handleFilterChange('genderNeutral')}
            />
            <FaTransgenderAlt />
            <span>Gender Neutral</span>
          </label>

          <label className={`filter-chip ${filters.free ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={filters.free}
              onChange={() => handleFilterChange('free')}
            />
            <FaDollarSign />
            <span>Free</span>
          </label>
        </div>

        {/* Radius Slider */}
        <div className="radius-control">
          <label htmlFor="radiusSlider" className="radius-label">
            Search Radius: <span className="radius-value">{radius} km</span>
          </label>
          <input
            type="range"
            id="radiusSlider"
            min="1"
            max="50"
            value={radius}
            onChange={handleRadiusChange}
            className="radius-slider"
          />
          <div className="radius-markers">
            <span>1km</span>
            <span>25km</span>
            <span>50km</span>
          </div>
  f      </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPanel;
