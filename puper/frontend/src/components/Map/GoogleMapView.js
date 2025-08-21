import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { initGoogleMaps } from '../../services/googleMaps';
import './GoogleMapView.css';

const GoogleMapComponent = ({ center, restrooms, onMarkerClick, onMapClick, addMode, addLocation }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [addMarker, setAddMarker] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        await initGoogleMaps();
        
        const mapOptions = {
          center: { 
            lat: center ? center[0] : 40.7128, 
            lng: center ? center[1] : -74.0060 
          },
          zoom: 15,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'simplified' }]
            }
          ]
        };

        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);

        // Create info window
        const newInfoWindow = new window.google.maps.InfoWindow();
        setInfoWindow(newInfoWindow);

        // Add click listener for adding restrooms
        if (addMode && onMapClick) {
          newMap.addListener('click', (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onMapClick({ lngLat: { lat, lng } });
          });
        }

      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
      }
    };

    if (mapRef.current) {
      initMap();
    }
  }, [center, addMode, onMapClick]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      map.setCenter({ lat: center[0], lng: center[1] });
    }
  }, [map, center]);

  // Create restroom markers
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    if (!restrooms || restrooms.length === 0) return;

    const newMarkers = restrooms.map(restroom => {
      const marker = new window.google.maps.Marker({
        position: { lat: restroom.lat, lng: restroom.lng || restroom.lon },
        map: map,
        title: restroom.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 25 15 25s15-10 15-25C30 6.7 23.3 0 15 0z" fill="#6B4423"/>
              <circle cx="15" cy="15" r="8" fill="white"/>
              <text x="15" y="20" text-anchor="middle" font-size="12" fill="#6B4423">🚽</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 40),
          anchor: new window.google.maps.Point(15, 40)
        }
      });

      marker.addListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(restroom);
        }

        // Show info window
        if (infoWindow) {
          const content = `
            <div class="restroom-info-window">
              <h3>${restroom.name}</h3>
              <p>${restroom.address}</p>
              ${restroom.rating ? `<p>⭐ ${restroom.rating} (${restroom.user_ratings_total || 0} reviews)</p>` : ''}
              ${restroom.distance ? `<p>📍 ${restroom.distance}m away</p>` : ''}
              <button onclick="window.selectRestroom('${restroom.id}')" class="select-btn">
                View Details
              </button>
            </div>
          `;
          
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Global function for info window buttons
    window.selectRestroom = (restroomId) => {
      const restroom = restrooms.find(r => r.id === restroomId);
      if (restroom && onMarkerClick) {
        onMarkerClick(restroom);
      }
    };

  }, [map, restrooms, onMarkerClick, infoWindow]);

  // Handle add location marker
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing add marker
    if (addMarker) {
      addMarker.setMap(null);
      setAddMarker(null);
    }

    if (addMode && addLocation) {
      const marker = new window.google.maps.Marker({
        position: { lat: addLocation.lat, lng: addLocation.lng || addLocation.lon },
        map: map,
        title: 'New Restroom Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 0C6.7 0 0 6.7 0 15c0 15 15 25 15 25s15-10 15-25C30 6.7 23.3 0 15 0z" fill="#6f02d6"/>
              <circle cx="15" cy="15" r="8" fill="white"/>
              <text x="15" y="20" text-anchor="middle" font-size="12" fill="#6f02d6">➕</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 40),
          anchor: new window.google.maps.Point(15, 40)
        },
        animation: window.google.maps.Animation.BOUNCE
      });

      setAddMarker(marker);

      // Stop bouncing after 3 seconds
      setTimeout(() => {
        if (marker) {
          marker.setAnimation(null);
        }
      }, 3000);
    }
  }, [map, addMode, addLocation, addMarker]);

  return (
    <div 
      ref={mapRef} 
      className={`google-map ${addMode ? 'add-mode' : ''}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

const GoogleMapView = (props) => {
  const render = (status) => {
    if (status === 'LOADING') {
      return (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading Google Maps...</p>
        </div>
      );
    }

    if (status === 'FAILURE') {
      return (
        <div className="map-error">
          <h3>Failed to load Google Maps</h3>
          <p>Please check your internet connection and try again.</p>
        </div>
      );
    }

    return <GoogleMapComponent {...props} />;
  };

  return (
    <Wrapper
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      render={render}
      libraries={['places', 'geometry']}
    />
  );
};

export default GoogleMapView;
