import React, { useState, useRef, useEffect } from 'react';
import { FaRoute, FaWalking, FaCar, FaBicycle, FaBus, FaClock, FaMapMarkerAlt, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
import { useDirections } from '../../hooks/useDirections';
import './DirectionsPanel.css';

const DirectionsPanel = ({ 
  origin, 
  destination, 
  restroom,
  map,
  onClose,
  className = ""
}) => {
  const [selectedTravelMode, setSelectedTravelMode] = useState('WALKING');
  const [isExpanded, setIsExpanded] = useState(false);
  const directionsDisplayRef = useRef(null);

  const {
    loading,
    error,
    directions,
    routeOptions,
    activeRoute,
    calculateRoute,
    getMultipleRouteOptions,
    displayDirections,
    clearDirections,
    switchRoute,
    formatDuration,
    formatDistance,
    getTravelModeIcon,
    getRouteSummary,
    getStepByStepInstructions
  } = useDirections();

  // Travel mode options
  const travelModes = [
    { key: 'WALKING', label: 'Walk', icon: FaWalking, color: '#6B4423' },
    { key: 'DRIVING', label: 'Drive', icon: FaCar, color: '#1E40AF' },
    { key: 'BICYCLING', label: 'Bike', icon: FaBicycle, color: '#059669' },
    { key: 'TRANSIT', label: 'Transit', icon: FaBus, color: '#7C2D12' }
  ];

  // Calculate directions when component mounts or inputs change
  useEffect(() => {
    if (origin && destination) {
      handleCalculateRoute();
    }
  }, [origin, destination]);

  // Display directions on map when available
  useEffect(() => {
    if (directions && map && directionsDisplayRef.current) {
      displayDirections(map, directionsDisplayRef.current);
    }
  }, [directions, map, displayDirections]);

  const handleCalculateRoute = async () => {
    if (!origin || !destination) return;

    try {
      await calculateRoute(origin, destination, {
        travelMode: window.google.maps?.TravelMode[selectedTravelMode] || 'WALKING'
      });
    } catch (err) {
      console.error('Failed to calculate route:', err);
    }
  };

  const handleTravelModeChange = async (mode) => {
    setSelectedTravelMode(mode);
    
    if (origin && destination) {
      await calculateRoute(origin, destination, {
        travelMode: window.google.maps?.TravelMode[mode] || 'WALKING'
      });
    }
  };

  const handleGetMultipleOptions = async () => {
    if (origin && destination) {
      await getMultipleRouteOptions(origin, destination);
    }
  };

  const handleClose = () => {
    clearDirections();
    if (onClose) onClose();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const routeSummary = getRouteSummary();
  const stepInstructions = getStepByStepInstructions();

  return (
    <div className={`directions-panel ${isExpanded ? 'expanded' : ''} ${className}`}>
      {/* Header */}
      <div className="directions-header">
        <div className="header-left">
          <FaRoute className="header-icon" />
          <div className="header-info">
            <h3>Directions</h3>
            {restroom && <span className="destination-name">to {restroom.name}</span>}
          </div>
        </div>
        
        <div className="header-controls">
          <button 
            onClick={toggleExpanded}
            className="expand-button"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>
          <button onClick={handleClose} className="close-button" title="Close directions">
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Travel Mode Selector */}
      <div className="travel-mode-selector">
        {travelModes.map(mode => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.key}
              className={`mode-button ${selectedTravelMode === mode.key ? 'active' : ''}`}
              onClick={() => handleTravelModeChange(mode.key)}
              style={{ '--mode-color': mode.color }}
              title={mode.label}
            >
              <Icon />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Route Summary */}
      {routeSummary && (
        <div className="route-summary">
          <div className="summary-item">
            <FaClock className="summary-icon" />
            <span>{formatDuration(routeSummary.duration)}</span>
          </div>
          <div className="summary-item">
            <FaMapMarkerAlt className="summary-icon" />
            <span>{formatDistance(routeSummary.distance)}</span>
          </div>
          <div className="summary-item">
            <span className="step-count">{routeSummary.stepCount} steps</span>
          </div>
        </div>
      )}

      {/* Multiple Route Options */}
      {routeOptions.length > 1 && (
        <div className="route-options">
          <h4>Route Options:</h4>
          <div className="route-option-buttons">
            {routeOptions.map((route, index) => (
              <button
                key={index}
                className={`route-option ${activeRoute === route ? 'active' : ''}`}
                onClick={() => switchRoute(index)}
              >
                <span className="route-mode">{getTravelModeIcon(route.travelMode)}</span>
                <div className="route-details">
                  <span className="route-duration">{formatDuration(route.summary.duration)}</span>
                  <span className="route-distance">{formatDistance(route.summary.distance)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Calculating route...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <strong>Error:</strong> {error}
          <button onClick={handleCalculateRoute} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {/* Directions Display */}
      <div className="directions-content">
        {/* Google Maps will inject turn-by-turn directions here */}
        <div ref={directionsDisplayRef} className="directions-display"></div>
        
        {/* Custom Step-by-Step Instructions */}
        {stepInstructions.length > 0 && isExpanded && (
          <div className="step-instructions">
            <h4>Step-by-Step Instructions:</h4>
            <ol className="instruction-list">
              {stepInstructions.map((step, index) => (
                <li key={index} className="instruction-step">
                  <div className="step-number">{step.stepNumber}</div>
                  <div className="step-content">
                    <div className="step-instruction" 
                         dangerouslySetInnerHTML={{ __html: step.htmlInstruction }} />
                    <div className="step-details">
                      <span className="step-distance">{formatDistance(step.distance)}</span>
                      <span className="step-duration">{formatDuration(step.duration)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="directions-actions">
        <button 
          onClick={handleGetMultipleOptions}
          className="action-button secondary"
          disabled={loading}
        >
          Compare Routes
        </button>
        <button 
          onClick={handleCalculateRoute}
          className="action-button primary"
          disabled={loading}
        >
          Recalculate
        </button>
      </div>
    </div>
  );
};

export default DirectionsPanel;
