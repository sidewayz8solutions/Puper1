import React, { useState, useCallback } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapView.css';

const MapView = ({ center, restrooms, onMarkerClick }) => {
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: center ? center[1] : -74.006,
    latitude: center ? center[0] : 40.7128,
    zoom: 14
  });

  const handleMarkerClick = useCallback((restroom) => {
    setSelectedRestroom(restroom);
    if (onMarkerClick) {
      onMarkerClick(restroom);
    }
  }, [onMarkerClick]);

  const getMarkerColor = (rating) => {
    if (rating >= 4) return '#10B981'; // green
    if (rating >= 3) return '#F59E0B'; // yellow
    if (rating >= 2) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  return (
    <div className="map-container">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
      >
        {restrooms && restrooms.map(restroom => (
          <Marker
            key={restroom.id}
            longitude={restroom.lon}
            latitude={restroom.lat}
            onClick={() => handleMarkerClick(restroom)}
          >
            <div
              className="marker-pin"
              style={{
                backgroundColor: getMarkerColor(restroom.avg_rating),
                width: '30px',
                height: '40px',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ transform: 'rotate(45deg)', fontSize: '16px' }}>🚽</span>
            </div>
          </Marker>
        ))}

        {selectedRestroom && (
          <Popup
            longitude={selectedRestroom.lon}
            latitude={selectedRestroom.lat}
            onClose={() => setSelectedRestroom(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="popup-content">
              <h3>{selectedRestroom.name}</h3>
              <p>{selectedRestroom.address}</p>
              <button
                onClick={() => handleMarkerClick(selectedRestroom)}
                className="view-details-btn"
              >
                View Details
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapView;
