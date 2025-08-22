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
          zoom: 18,
          mapTypeId: window.google.maps.MapTypeId.SATELLITE,
          tilt: 45, // Enable 3D view
          heading: 0,
          gestureHandling: 'greedy',
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'transit.station',
              stylers: [{ visibility: 'on' }]
            }
          ],
          mapTypeControlOptions: {
            mapTypeIds: [
              window.google.maps.MapTypeId.ROADMAP,
              window.google.maps.MapTypeId.SATELLITE,
              window.google.maps.MapTypeId.HYBRID,
              window.google.maps.MapTypeId.TERRAIN
            ]
          }
        };

        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);

        // Enable 3D buildings
        newMap.setTilt(45);

        // Add 3D controls
        const rotateControl = document.createElement('div');
        rotateControl.innerHTML = `
          <div style="background: white; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); margin: 10px; padding: 8px;">
            <button onclick="window.rotateMap(-15)" style="margin: 2px; padding: 4px 8px; border: none; background: #6B4423; color: white; border-radius: 3px; cursor: pointer;">↺</button>
            <button onclick="window.rotateMap(15)" style="margin: 2px; padding: 4px 8px; border: none; background: #6B4423; color: white; border-radius: 3px; cursor: pointer;">↻</button>
            <button onclick="window.toggle3D()" style="margin: 2px; padding: 4px 8px; border: none; background: #6f02d6; color: white; border-radius: 3px; cursor: pointer;">3D</button>
          </div>
        `;
        newMap.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(rotateControl);

        // Global functions for 3D controls
        window.rotateMap = (degrees) => {
          const currentHeading = newMap.getHeading() || 0;
          newMap.setHeading(currentHeading + degrees);
        };

        window.toggle3D = () => {
          const currentTilt = newMap.getTilt();
          newMap.setTilt(currentTilt === 0 ? 45 : 0);
        };

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
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6B4423;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#4A2F18;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
                </filter>
              </defs>
              <path d="M20 0C11.2 0 4 7.2 4 16c0 20 16 34 16 34s16-14 16-34C36 7.2 28.8 0 20 0z" fill="url(#grad1)" filter="url(#shadow)"/>
              <circle cx="20" cy="16" r="10" fill="white" stroke="#6B4423" stroke-width="2"/>
              <text x="20" y="22" text-anchor="middle" font-size="14" fill="#6B4423">🚽</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50)
        },
        animation: window.google.maps.Animation.DROP
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
