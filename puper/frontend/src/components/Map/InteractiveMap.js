import React, { useRef, useEffect, useState } from 'react';
import { FaPlus, FaDirections, FaInfo, FaTimes, FaCrosshairs } from 'react-icons/fa';
import { useMapClickEvents } from '../../hooks/useMapClickEvents';
import { useMapStyles } from '../../hooks/useMapStyles';
import MapStyleSelector from './MapStyleSelector';
import './InteractiveMap.css';

const InteractiveMap = ({
  center = { lat: 37.0902, lng: -95.7129 }, // USA center default
  zoom = 12,
  restrooms = [],
  onRestroomClick,
  onAddRestroom,
  onGetDirections,
  showStyleSelector = true,
  showAddButton = true,
  className = ""
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { applyPuperStyle } = useMapStyles();

  const {
    clickData,
    selectedRestroom,
    isAddingRestroom,
    contextMenu,
    initializeMap,
    addRestroomMarker,
    clearAllMarkers,
    panToRestroom,
    startAddRestroomMode,
    cancelAddRestroomMode,
    closeContextMenu,
    setSelectedRestroom
  } = useMapClickEvents({
    onMapClick: handleMapClick,
    onMarkerClick: handleMarkerClick,
    onAddRestroom: handleAddRestroom
  });

  // Initialize Google Map
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'cooperative'
    });

    mapInstanceRef.current = map;
    
    // Apply Puper style
    applyPuperStyle(map);
    
    // Initialize click events
    initializeMap(map);
    
    setIsMapLoaded(true);
  }, [center, zoom, initializeMap, applyPuperStyle]);

  // Add restroom markers when restrooms change
  useEffect(() => {
    if (!isMapLoaded || !restrooms) return;

    clearAllMarkers();
    
    restrooms.forEach(restroom => {
      addRestroomMarker(restroom, {
        icon: {
          url: '/icons/restroom-marker.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });
    });
  }, [restrooms, isMapLoaded, addRestroomMarker, clearAllMarkers]);

  function handleMapClick(clickData) {
    if (isAddingRestroom) {
      // Handle adding new restroom
      if (onAddRestroom) {
        onAddRestroom({
          lat: clickData.lat,
          lng: clickData.lng,
          coordinates: clickData.coordinates
        });
      }
      cancelAddRestroomMode();
    }
  }

  function handleMarkerClick(clickData) {
    const restroom = clickData.markerData;
    setSelectedRestroom(restroom);
    
    if (onRestroomClick) {
      onRestroomClick(restroom);
    }
  }

  function handleAddRestroom(location) {
    if (onAddRestroom) {
      onAddRestroom(location);
    }
  }

  const handleContextMenuAction = (action, location) => {
    switch (action) {
      case 'addRestroom':
        if (onAddRestroom) {
          onAddRestroom(location);
        }
        break;
      case 'getDirections':
        if (onGetDirections) {
          onGetDirections(location);
        }
        break;
      case 'centerHere':
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location);
        }
        break;
    }
    closeContextMenu();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(15);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your current location');
        }
      );
    }
  };

  return (
    <div className={`interactive-map ${className}`}>
      {/* Map Container */}
      <div ref={mapRef} className="map-container" />

      {/* Map Controls */}
      <div className="map-controls">
        {/* Style Selector */}
        {showStyleSelector && isMapLoaded && (
          <MapStyleSelector 
            map={mapInstanceRef.current}
            className="map-control"
          />
        )}

        {/* Add Restroom Button */}
        {showAddButton && (
          <button
            className={`map-control add-restroom-btn ${isAddingRestroom ? 'active' : ''}`}
            onClick={isAddingRestroom ? cancelAddRestroomMode : startAddRestroomMode}
            title={isAddingRestroom ? 'Cancel adding restroom' : 'Add new restroom'}
          >
            {isAddingRestroom ? <FaTimes /> : <FaPlus />}
            <span>{isAddingRestroom ? 'Cancel' : 'Add Restroom'}</span>
          </button>
        )}

        {/* Current Location Button */}
        <button
          className="map-control current-location-btn"
          onClick={getCurrentLocation}
          title="Go to current location"
        >
          <FaCrosshairs />
        </button>
      </div>

      {/* Add Restroom Instructions */}
      {isAddingRestroom && (
        <div className="add-restroom-instructions">
          <div className="instructions-content">
            <FaInfo className="instructions-icon" />
            <span>Click on the map to add a new restroom at that location</span>
            <button onClick={cancelAddRestroomMode} className="cancel-btn">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="context-menu-overlay" onClick={closeContextMenu} />
          <div 
            className="context-menu"
            style={{ 
              left: contextMenu.x, 
              top: contextMenu.y 
            }}
          >
            <div className="context-menu-header">
              <span>Map Options</span>
              <button onClick={closeContextMenu} className="close-context-btn">
                <FaTimes />
              </button>
            </div>
            
            <div className="context-menu-items">
              <button 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('addRestroom', contextMenu.location)}
              >
                <FaPlus className="context-icon" />
                <span>Add Restroom Here</span>
              </button>
              
              <button 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('getDirections', contextMenu.location)}
              >
                <FaDirections className="context-icon" />
                <span>Get Directions</span>
              </button>
              
              <button 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('centerHere', contextMenu.location)}
              >
                <FaCrosshairs className="context-icon" />
                <span>Center Map Here</span>
              </button>
            </div>
            
            <div className="context-menu-footer">
              <div className="coordinates">
                {contextMenu.location.lat.toFixed(6)}, {contextMenu.location.lng.toFixed(6)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Selected Restroom Info */}
      {selectedRestroom && (
        <div className="selected-restroom-info">
          <div className="restroom-info-header">
            <h3>{selectedRestroom.name}</h3>
            <button onClick={() => setSelectedRestroom(null)} className="close-info-btn">
              <FaTimes />
            </button>
          </div>
          
          <div className="restroom-info-content">
            <p className="restroom-address">{selectedRestroom.address}</p>
            
            {selectedRestroom.rating && (
              <div className="restroom-rating">
                Rating: {selectedRestroom.rating}/5
              </div>
            )}
            
            <div className="restroom-actions">
              <button 
                className="action-btn primary"
                onClick={() => {
                  if (onGetDirections) {
                    onGetDirections(selectedRestroom);
                  }
                }}
              >
                <FaDirections />
                Get Directions
              </button>
              
              <button 
                className="action-btn secondary"
                onClick={() => panToRestroom(selectedRestroom)}
              >
                <FaCrosshairs />
                Center Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click Data Debug (development only) */}
      {process.env.NODE_ENV === 'development' && clickData && (
        <div className="click-debug">
          <strong>Last Click:</strong> {clickData.coordinates}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
