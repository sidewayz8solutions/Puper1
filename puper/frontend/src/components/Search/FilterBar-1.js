import React from 'react';
import { motion } from 'framer-motion';
import { FaWheelchair, FaBaby, FaTransgender, FaDollarSign, FaFilter } from 'react-icons/fa';
import './FilterBar.css';

const FilterBar = ({ filters, onChange }) => {
  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      wheelchair_accessible: false,
      baby_changing: false,
      gender_neutral: false,
      requires_fee: false,
      radius: 5000
    });
  };

  return (
    <motion.div 
      className="filter-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="filter-header">
        <FaFilter className="filter-icon" />
        <span>Filters</span>
        <button onClick={clearFilters} className="clear-filters">
          Clear All
        </button>
      </div>
      
      <div className="filter-options">
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.wheelchair_accessible || false}
            onChange={(e) => handleFilterChange('wheelchair_accessible', e.target.checked)}
          />
          <FaWheelchair />
          <span>Wheelchair Accessible</span>
        </label>
        
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.baby_changing || false}
            onChange={(e) => handleFilterChange('baby_changing', e.target.checked)}
          />
          <FaBaby />
          <span>Baby Changing</span>
        </label>
        
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.gender_neutral || false}
            onChange={(e) => handleFilterChange('gender_neutral', e.target.checked)}
          />
          <FaTransgender />
          <span>Gender Neutral</span>
        </label>
        
        <label className="filter-option">
          <input
            type="checkbox"
            checked={!filters.requires_fee}
            onChange={(e) => handleFilterChange('requires_fee', !e.target.checked)}
          />
          <FaDollarSign />
          <span>Free</span>
        </label>
        
        <div className="radius-filter">
          <label>
            <span>Radius: {(filters.radius || 5000) / 1000}km</span>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={filters.radius || 5000}
              onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
              className="radius-slider"
            />
          </label>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;
