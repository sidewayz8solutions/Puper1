import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import { useGeocoding } from '../../hooks/useGeocoding';
import './LocationSearch.css';

const LocationSearch = ({ 
  onLocationSelect, 
  placeholder = "Search for an address...",
  showCurrentLocation = true,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const { 
    geocodeAddress, 
    getLocationSuggestions, 
    loading, 
    error, 
    clearResults 
  } = useGeocoding();

  // Debounce search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 3) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      const results = await getLocationSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const result = await geocodeAddress(query);
      if (result) {
        onLocationSelect(result);
        setQuery(result.address);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.address);
    setShowSuggestions(false);
    onLocationSelect(suggestion);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
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
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    clearResults();
    inputRef.current?.focus();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Reverse geocode to get address
          try {
            const result = await geocodeAddress(`${location.lat},${location.lng}`);
            if (result) {
              setQuery(result.address);
              onLocationSelect(result);
            }
          } catch (err) {
            // Fallback to coordinates
            onLocationSelect({
              ...location,
              address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your current location');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
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
    <div className={`location-search ${className}`}>
      <div className="search-input-container">
        <FaSearch className="search-icon" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
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

        {showCurrentLocation && (
          <button 
            onClick={getCurrentLocation}
            className="current-location-button"
            type="button"
            title="Use current location"
          >
            <FaMapMarkerAlt />
          </button>
        )}
      </div>

      {error && (
        <div className="search-error">
          {error}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <FaMapMarkerAlt className="suggestion-icon" />
              <div className="suggestion-content">
                <div className="suggestion-address">{suggestion.address}</div>
                {suggestion.types && (
                  <div className="suggestion-types">
                    {suggestion.types.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
