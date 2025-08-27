import React, { useRef, useEffect, useState, useCallback } from 'react';
// import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { FaCube, FaTrafficLight, FaCrosshairs, FaExpand, FaRoute, FaCompress } from 'react-icons/fa';
import './AdvancedGoogleMapView.css';

const AdvancedGoogleMapView = ({ 
  center, 
  restrooms, 
  onMarkerClick, 
  onMapClick, 
  addMode, 
  addLocation,
  userLocation 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  // const [markerClusterer, setMarkerClusterer] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  
  // Map controls state
  const [is3DMode, setIs3DMode] = useState(false);
  const [trafficLayer, setTrafficLayer] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDirections, setShowDirections] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = async () => {
      try {
        const mapOptions = {
          center: center || { lat: 37.0902, lng: -95.7129 },
          zoom: 15,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          gestureHandling: 'greedy',
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: false, // We'll use our custom control
          styles: [
            // Hide all POI types except gas stations and rest stops
            {
              featureType: "poi",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "poi.gas_station",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "poi.park",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            },
            // Hide business POIs except gas stations
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }]
            },
            // Hide attractions, government, medical, etc.
            {
              featureType: "poi.attraction",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "poi.government",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "poi.medical",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "poi.place_of_worship",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "poi.school",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "poi.sports_complex",
              stylers: [{ visibility: "off" }]
            },
            // Keep road markings and names
            {
              featureType: "road",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ visibility: "on" }]
            },
            // Hide transit except for rest stops
            {
              featureType: "transit",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "transit.station.bus",
              stylers: [{ visibility: "on" }]
            },
            // Keep administrative labels (city names, etc.)
            {
              featureType: "administrative",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            }
          ]
        };

        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);

        // Initialize services
        const traffic = new window.google.maps.TrafficLayer();
        setTrafficLayer(traffic);

        const directionsServiceInstance = new window.google.maps.DirectionsService();
        const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#6B4423', // Puper brown
            strokeWeight: 6,
            strokeOpacity: 0.8
          }
        });
        directionsRendererInstance.setMap(newMap);
        
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);

        // Initialize marker clusterer (temporarily disabled)
        // const clusterer = new MarkerClusterer({
        //   map: newMap,
        //   markers: [],
        //   algorithm: new window.google.maps.marker.SuperClusterAlgorithm({
        //     radius: 100,
        //     maxZoom: 16
        //   }),
        //   renderer: {
        //     render: ({ count, position }) => {
        //       // Custom cluster marker
        //       return new window.google.maps.Marker({
        //         position,
        //         icon: {
        //           url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        //             <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        //               <circle cx="30" cy="30" r="25" fill="#6B4423" stroke="white" stroke-width="3"/>
        //               <text x="30" y="35" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${count}</text>
        //             </svg>
        //           `),
        //           scaledSize: new window.google.maps.Size(60, 60),
        //           anchor: new window.google.maps.Point(30, 30)
        //         },
        //         zIndex: 1000
        //       });
        //     }
        //   }
        // });
        // setMarkerClusterer(clusterer);

        // Map click handler for add mode
        if (addMode) {
          newMap.addListener('click', (event) => {
            onMapClick?.(event.latLng.lat(), event.latLng.lng());
          });
        }

      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initMap();
  }, [center, map, addMode, onMapClick]);

  // Create custom marker for restrooms
  const createRestroomMarker = useCallback((restroom) => {
    const rating = restroom.avg_rating || 0;
    const reviewCount = restroom.review_count || 0;
    
    // Color based on rating
    let markerColor = '#6B4423'; // Default brown
    if (rating >= 4) markerColor = '#22C55E'; // Green for high rating
    else if (rating >= 3) markerColor = '#F59E0B'; // Yellow for medium rating
    else if (rating > 0) markerColor = '#EF4444'; // Red for low rating

    const marker = new window.google.maps.Marker({
      position: { lat: restroom.lat, lng: restroom.lon },
      title: restroom.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${markerColor};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${markerColor}CC;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="url(#grad1)" stroke="white" stroke-width="2"/>
            <circle cx="20" cy="20" r="12" fill="white"/>
            <text x="20" y="26" text-anchor="middle" fill="${markerColor}" font-size="16" font-weight="bold">🚽</text>
            ${reviewCount > 0 ? `<circle cx="32" cy="12" r="8" fill="#EF4444"/>
            <text x="32" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${reviewCount}</text>` : ''}
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 50),
        anchor: new window.google.maps.Point(20, 50)
      },
      optimized: false
    });

    // Add click listener
    marker.addListener('click', () => {
      onMarkerClick?.(restroom);
    });

    return marker;
  }, [onMarkerClick]);

  // Update markers when restrooms change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = restrooms.map(createRestroomMarker);
    setMarkers(newMarkers);

    // Add markers directly to map (clusterer temporarily disabled)
    newMarkers.forEach(marker => marker.setMap(map));

  }, [map, restrooms, createRestroomMarker]);

  // 3D View Toggle
  const toggle3DView = useCallback(() => {
    if (!map) return;
    
    if (is3DMode) {
      map.setTilt(0);
      map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
      setIs3DMode(false);
    } else {
      map.setTilt(45);
      map.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
      setIs3DMode(true);
    }
  }, [map, is3DMode]);

  // Traffic Layer Toggle
  const toggleTraffic = useCallback(() => {
    if (!trafficLayer) return;
    
    if (trafficLayer.getMap()) {
      trafficLayer.setMap(null);
    } else {
      trafficLayer.setMap(map);
    }
  }, [trafficLayer, map]);

  // Center on User Location
  const centerOnUser = useCallback(() => {
    if (userLocation && map) {
      map.setCenter(userLocation);
      map.setZoom(18);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(userPos);
          map.setZoom(18);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [map, userLocation]);

  // Get Directions
  const getDirections = useCallback((destination) => {
    if (!directionsService || !directionsRenderer || !userLocation) return;

    const request = {
      origin: userLocation,
      destination: { lat: destination.lat, lng: destination.lon },
      travelMode: window.google.maps.TravelMode.WALKING
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        setShowDirections(true);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  }, [directionsService, directionsRenderer, userLocation]);

  // Clear Directions
  const clearDirections = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
      setShowDirections(false);
    }
  }, [directionsRenderer]);

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    const mapContainer = mapRef.current?.parentElement;
    if (!mapContainer) return;

    if (!isFullscreen) {
      if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  return (
    <div className="advanced-map-container">
      <div ref={mapRef} className="advanced-google-map" />
      
      {/* Advanced Map Controls */}
      <div className="advanced-map-controls">
        <button 
          className={`map-control-btn ${is3DMode ? 'active' : ''}`}
          onClick={toggle3DView}
          title="Toggle 3D View"
        >
          <FaCube />
        </button>
        
        <button 
          className={`map-control-btn ${trafficLayer?.getMap() ? 'active' : ''}`}
          onClick={toggleTraffic}
          title="Toggle Traffic"
        >
          <FaTrafficLight />
        </button>
        
        <button 
          className="map-control-btn"
          onClick={centerOnUser}
          title="Center on My Location"
        >
          <FaCrosshairs />
        </button>
        
        {showDirections && (
          <button 
            className="map-control-btn active"
            onClick={clearDirections}
            title="Clear Directions"
          >
            <FaRoute />
          </button>
        )}
        
        <button 
          className={`map-control-btn ${isFullscreen ? 'active' : ''}`}
          onClick={toggleFullscreen}
          title="Fullscreen"
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>

      {/* Add mode indicator */}
      {addMode && (
        <div className="add-mode-indicator">
          📍 Click on the map to add a restroom location
        </div>
      )}
    </div>
  );
};

export default AdvancedGoogleMapView;
