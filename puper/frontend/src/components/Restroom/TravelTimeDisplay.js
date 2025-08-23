import React, { useEffect, useState } from 'react';
import { FaWalking, FaCar, FaBicycle, FaBus, FaClock, FaRoute } from 'react-icons/fa';
import { useDistanceMatrix } from '../../hooks/useDistanceMatrix';
import './TravelTimeDisplay.css';

const TravelTimeDisplay = ({ 
  userLocation, 
  restroom, 
  travelMode = 'WALKING',
  showModeSelector = false,
  compact = false 
}) => {
  const { getTravelTime, loading, error, formatDuration, formatDistance } = useDistanceMatrix();
  const [travelData, setTravelData] = useState(null);
  const [selectedMode, setSelectedMode] = useState(travelMode);

  // Travel mode icons
  const modeIcons = {
    WALKING: FaWalking,
    DRIVING: FaCar,
    BICYCLING: FaBicycle,
    TRANSIT: FaBus
  };

  // Travel mode labels
  const modeLabels = {
    WALKING: 'Walk',
    DRIVING: 'Drive',
    BICYCLING: 'Bike',
    TRANSIT: 'Transit'
  };

  // Calculate travel time when location or mode changes
  useEffect(() => {
    if (userLocation && restroom) {
      calculateTravelTime();
    }
  }, [userLocation, restroom, selectedMode]);

  const calculateTravelTime = async () => {
    try {
      const result = await getTravelTime(userLocation, restroom, {
        travelMode: selectedMode
      });
      setTravelData(result);
    } catch (err) {
      console.error('Failed to calculate travel time:', err);
    }
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
  };

  if (loading) {
    return (
      <div className={`travel-time-display ${compact ? 'compact' : ''}`}>
        <div className="travel-loading">
          <FaClock className="loading-icon" />
          <span>Calculating...</span>
        </div>
      </div>
    );
  }

  if (error || !travelData) {
    return (
      <div className={`travel-time-display ${compact ? 'compact' : ''}`}>
        <div className="travel-error">
          <FaRoute className="error-icon" />
          <span>Distance unavailable</span>
        </div>
      </div>
    );
  }

  const ModeIcon = modeIcons[selectedMode] || FaWalking;

  if (compact) {
    return (
      <div className="travel-time-display compact">
        <div className="travel-info-compact">
          <ModeIcon className="mode-icon" />
          <span className="duration">{travelData.duration.text}</span>
          <span className="distance">({travelData.distance.text})</span>
        </div>
      </div>
    );
  }

  return (
    <div className="travel-time-display">
      {showModeSelector && (
        <div className="travel-mode-selector">
          {Object.keys(modeIcons).map(mode => {
            const Icon = modeIcons[mode];
            return (
              <button
                key={mode}
                className={`mode-btn ${selectedMode === mode ? 'active' : ''}`}
                onClick={() => handleModeChange(mode)}
                title={modeLabels[mode]}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      )}

      <div className="travel-info">
        <div className="travel-main">
          <ModeIcon className="mode-icon" />
          <div className="travel-details">
            <div className="duration">
              <FaClock className="detail-icon" />
              <span>{travelData.duration.text}</span>
            </div>
            <div className="distance">
              <FaRoute className="detail-icon" />
              <span>{travelData.distance.text}</span>
            </div>
          </div>
        </div>

        <div className="travel-summary">
          <span className="mode-label">{modeLabels[selectedMode]}</span>
          <span className="summary-text">
            {travelData.duration.minutes} min • {travelData.distance.km}km
          </span>
        </div>
      </div>
    </div>
  );
};

export default TravelTimeDisplay;
