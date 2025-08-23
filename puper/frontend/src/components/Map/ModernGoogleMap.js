import React, { useEffect, useRef, useState } from 'react';
import ReverseGeocodePanel from './ReverseGeocodePanel';
import './ModernGoogleMap.css';

const ModernGoogleMap = ({ 
  center = { lat: 29.9511, lng: -90.0715 }, // New Orleans default
  zoom = 12,
  mapId = "PUPER_MAP_ID",
  restrooms = [],
  onMarkerClick,
  onMapClick,
  showReverseGeocodePanel = true,
  className = ""
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Initialize map when Google Maps loads
  useEffect(() => {
    const initMap = () => {
      if (window.google && window.google.maps && mapRef.current) {
        // Get the inner map from the gmp-map web component
        const gmpMap = mapRef.current.querySelector('gmp-map');
        if (gmpMap && gmpMap.innerMap) {
          const mapInstance = gmpMap.innerMap;
          setMap(mapInstance);
          
          // Initialize geocoder
          const geocoderInstance = new window.google.maps.Geocoder();
          setGeocoder(geocoderInstance);

          // Add click listener for reverse geocoding
          mapInstance.addListener('click', (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            setSelectedLocation({ lat, lng });
            
            if (onMapClick) {
              onMapClick(lat, lng);
            }
          });
        }
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Wait for Google Maps to load
      window.initMap = initMap;
    }
  }, [onMapClick]);

  // Update markers when restrooms change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => {
      if (marker.remove) marker.remove();
    });

    // Create new markers for restrooms
    const newMarkers = restrooms.map(restroom => {
      const marker = document.createElement('gmp-advanced-marker');
      marker.position = { lat: restroom.lat, lng: restroom.lon || restroom.lng };
      marker.title = restroom.name;
      
      // Create custom marker content
      const markerContent = document.createElement('div');
      markerContent.className = 'custom-marker';
      markerContent.innerHTML = `
        <div class="marker-icon">🚽</div>
        <div class="marker-label">${restroom.name}</div>
      `;
      
      marker.appendChild(markerContent);
      
      // Add click listener
      marker.addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(restroom);
        }
      });

      // Add to map
      const gmpMap = mapRef.current.querySelector('gmp-map');
      if (gmpMap) {
        gmpMap.appendChild(marker);
      }

      return marker;
    });

    setMarkers(newMarkers);
  }, [map, restrooms, onMarkerClick]);

  // Handle reverse geocoding result
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    
    // Center map on selected location
    if (map) {
      map.setCenter({ lat: location.lat, lng: location.lng });
      map.setZoom(15);
    }

    // Add marker for selected location
    const gmpMap = mapRef.current.querySelector('gmp-map');
    if (gmpMap) {
      // Remove existing reverse geocode marker
      const existingMarker = gmpMap.querySelector('.reverse-geocode-marker');
      if (existingMarker) {
        existingMarker.remove();
      }

      // Add new marker
      const marker = document.createElement('gmp-advanced-marker');
      marker.position = { lat: location.lat, lng: location.lng };
      marker.className = 'reverse-geocode-marker';
      
      const markerContent = document.createElement('div');
      markerContent.className = 'reverse-geocode-marker-content';
      markerContent.innerHTML = `
        <div class="reverse-marker-icon">📍</div>
      `;
      
      marker.appendChild(markerContent);
      gmpMap.appendChild(marker);

      // Show info window with address
      if (window.google && window.google.maps) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="info-window-content">
            <strong>Selected Location</strong><br>
            ${location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
          </div>`
        });
        
        marker.addEventListener('click', () => {
          infoWindow.open({ anchor: marker });
        });
        
        // Auto-open info window
        setTimeout(() => {
          infoWindow.open({ anchor: marker });
        }, 500);
      }
    }
  };

  return (
    <div className={`modern-google-map ${className}`} ref={mapRef}>
      {/* Google Maps Web Component */}
      <gmp-map 
        center={`${center.lat},${center.lng}`}
        zoom={zoom}
        map-id={mapId}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Reverse Geocode Panel */}
        {showReverseGeocodePanel && (
          <div className="floating-panel" slot="control-block-start-inline-center">
            <ReverseGeocodePanel
              onLocationSelect={handleLocationSelect}
              initialCoordinates={selectedLocation}
            />
          </div>
        )}
      </gmp-map>
    </div>
  );
};

export default ModernGoogleMap;
