import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTimes, FaSpinner, FaClock, FaStar, FaPhone, FaGlobe } from 'react-icons/fa';
import { usePlacesAutocomplete } from '../../hooks/usePlacesAutocomplete';
import './AdvancedAutocomplete.css';

const AdvancedAutocomplete = ({ 
  onPlaceSelect,
  onLocationSelect,
  placeholder = "Search for places...",
  userLocation = null,
  searchType = 'general', // 'general', 'restrooms', 'establishments'
  showPlaceDetails = true,
  countries = [],
  locationBias = null,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showPlaceInfo, setShowPlaceInfo] = useState(false);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const {
    loading,
    error,
    predictions,
    selectedPlace,
    getAutocompletePredictions,
    getRestroomSuggestions,
    selectPrediction,
    clearData
  } = usePlacesAutocomplete({
    debounceMs: 300,
    minLength: 2
  });

  // Handle input changes with autocomplete
  useEffect(() => {
    if (query.length >= 2) {
      handleSearch();
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = async () => {
    const autocompleteOptions = {
      countries: countries.length > 0 ? countries : undefined,
      locationBias: locationBias || (userLocation ? {
        center: userLocation,
        radius: 10000
      } : undefined)
    };

    try {
      let results;
      if (searchType === 'restrooms') {
        results = await getRestroomSuggestions(query, userLocation);
      } else {
        results = await getAutocompletePredictions(query, autocompleteOptions);
      }
      
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = async (prediction) => {
    setQuery(prediction.description);
    setShowSuggestions(false);
    
    try {
      const placeDetails = await selectPrediction(prediction);
      if (placeDetails) {
        if (showPlaceDetails) {
          setShowPlaceInfo(true);
        }
        
        if (onPlaceSelect) {
          onPlaceSelect(placeDetails);
        }
        
        if (onLocationSelect && placeDetails.location) {
          onLocationSelect(placeDetails.location);
        }
      }
    } catch (err) {
      console.error('Failed to get place details:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || predictions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && predictions[selectedIndex]) {
          handleSuggestionClick(predictions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setShowPlaceInfo(false);
    setSelectedIndex(-1);
    clearData();
    inputRef.current?.focus();
  };

  const closePlaceInfo = () => {
    setShowPlaceInfo(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`advanced-autocomplete ${className}`}>
      {/* Search Input */}
      <div className="autocomplete-input-container">
        <FaSearch className="search-icon" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="autocomplete-input"
          disabled={loading}
        />

        {loading && <FaSpinner className="loading-icon spinning" />}
        
        {query && !loading && (
          <button 
            onClick={handleClear}
            className="clear-button"
            type="button"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="autocomplete-error">
          {error}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && predictions.length > 0 && (
        <div ref={suggestionsRef} className="suggestions-dropdown">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.placeId}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(prediction)}
            >
              <FaMapMarkerAlt className="suggestion-icon" />
              <div className="suggestion-content">
                <div className="suggestion-main">{prediction.mainText}</div>
                <div className="suggestion-secondary">{prediction.secondaryText}</div>
                {prediction.types.length > 0 && (
                  <div className="suggestion-types">
                    {prediction.types.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Details Modal */}
      {showPlaceInfo && selectedPlace && (
        <div className="place-details-overlay">
          <div className="place-details-modal">
            <div className="place-details-header">
              <h3>{selectedPlace.name}</h3>
              <button onClick={closePlaceInfo} className="close-details-btn">
                <FaTimes />
              </button>
            </div>
            
            <div className="place-details-content">
              <div className="place-address">
                <FaMapMarkerAlt className="detail-icon" />
                <span>{selectedPlace.formattedAddress}</span>
              </div>

              {selectedPlace.rating && (
                <div className="place-rating">
                  <FaStar className="detail-icon" />
                  <span>{selectedPlace.rating} / 5</span>
                </div>
              )}

              {selectedPlace.phoneNumber && (
                <div className="place-phone">
                  <FaPhone className="detail-icon" />
                  <span>{selectedPlace.phoneNumber}</span>
                </div>
              )}

              {selectedPlace.website && (
                <div className="place-website">
                  <FaGlobe className="detail-icon" />
                  <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </div>
              )}

              {selectedPlace.openingHours && (
                <div className="place-hours">
                  <FaClock className="detail-icon" />
                  <div className="hours-info">
                    <span className={`status ${selectedPlace.openingHours.isOpen ? 'open' : 'closed'}`}>
                      {selectedPlace.openingHours.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                    {selectedPlace.openingHours.weekdayText && (
                      <div className="hours-list">
                        {selectedPlace.openingHours.weekdayText.slice(0, 3).map((hours, index) => (
                          <div key={index} className="hours-item">{hours}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                <div className="place-photos">
                  <img 
                    src={selectedPlace.photos[0].url} 
                    alt={selectedPlace.name}
                    className="place-photo"
                  />
                </div>
              )}

              <div className="place-types">
                <strong>Categories:</strong>
                <div className="types-list">
                  {selectedPlace.types.slice(0, 5).map(type => (
                    <span key={type} className="type-tag">
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="place-details-actions">
              <button 
                onClick={() => {
                  if (onLocationSelect && selectedPlace.location) {
                    onLocationSelect(selectedPlace.location);
                  }
                  closePlaceInfo();
                }}
                className="action-btn primary"
              >
                Use This Location
              </button>
              <button onClick={closePlaceInfo} className="action-btn secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAutocomplete;
