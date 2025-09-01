import React, { useState, useRef, useEffect } from 'react';
import { FaMapMarkerAlt, FaSearch, FaCopy, FaCheck } from 'react-icons/fa';
import { useGeocoding } from '../../hooks/useGeocoding';
import './ReverseGeocodePanel.css';

const ReverseGeocodePanel = ({ 
  onLocationSelect, 
  initialCoordinates = null,
  showOnMap = true,
  className = ""
}) => {
  const [coordinates, setCoordinates] = useState(
    initialCoordinates ? `${initialCoordinates.lat},${initialCoordinates.lng}` : ''
  );
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { reverseGeocode, loading, error } = useGeocoding();

  // Handle reverse geocoding
  const handleReverseGeocode = async () => {
    if (!coordinates.trim()) return;

    const coordsArray = coordinates.split(',').map(coord => parseFloat(coord.trim()));
    
    if (coordsArray.length !== 2 || coordsArray.some(isNaN)) {
      alert('Please enter valid coordinates in format: latitude,longitude');
      return;
    }

    const [lat, lng] = coordsArray;

    try {
      const result = await reverseGeocode(lat, lng);
      if (result) {
        setAddress(result.address);
        
        // Notify parent component
        if (onLocationSelect) {
          onLocationSelect({
            lat,
            lng,
            address: result.address,
            ...result
          });
        }
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  // Handle coordinate input change
  const handleCoordinateChange = (e) => {
    setCoordinates(e.target.value);
    setAddress(''); // Clear previous address
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleReverseGeocode();
    }
  };

  // Copy coordinates to clipboard
  const copyCoordinates = async () => {
    if (!coordinates) return;

    try {
      await navigator.clipboard.writeText(coordinates);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy coordinates:', err);
    }
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates(`${lat.toFixed(6)},${lng.toFixed(6)}`);
          
          // Auto-reverse geocode current location
          setTimeout(() => {
            handleReverseGeocode();
          }, 100);
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

  // Update coordinates when initialCoordinates prop changes
  useEffect(() => {
    if (initialCoordinates) {
      setCoordinates(`${initialCoordinates.lat},${initialCoordinates.lng}`);
    }
  }, [initialCoordinates]);

  return (
    <div className={`reverse-geocode-panel ${className}`}>
      <div className="panel-header">
        <FaMapMarkerAlt className="header-icon" />
        <h3>Reverse Geocoding</h3>
      </div>

      <div className="coordinate-input-section">
        <label htmlFor="coordinates">Coordinates (lat,lng):</label>
        <div className="input-group">
          <input
            id="coordinates"
            type="text"
            value={coordinates}
            onChange={handleCoordinateChange}
            onKeyPress={handleKeyPress}
            placeholder="40.714224,-73.961452"
            className="coordinate-input"
            disabled={loading}
          />
          <button
            onClick={copyCoordinates}
            className="copy-button"
            title="Copy coordinates"
            disabled={!coordinates}
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <button
          onClick={handleReverseGeocode}
          className="geocode-button"
          disabled={loading || !coordinates.trim()}
        >
          <FaSearch />
          {loading ? 'Geocoding...' : 'Reverse Geocode'}
        </button>
        
        <button
          onClick={getCurrentLocation}
          className="current-location-button"
          disabled={loading}
        >
          <FaMapMarkerAlt />
          Use Current Location
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {address && (
        <div className="address-result">
          <label>Address:</label>
          <div className="address-display">
            <div className="address-text">{address}</div>
            <button
              onClick={copyAddress}
              className="copy-button"
              title="Copy address"
            >
              {copied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>
      )}

      <div className="instructions">
        <p>
          <strong>Instructions:</strong> Enter coordinates in the format 
          <code>latitude,longitude</code> (e.g., 40.714224,-73.961452) 
          and click "Reverse Geocode" to get the address.
        </p>
      </div>
    </div>
  );
};

export default ReverseGeocodePanel;
