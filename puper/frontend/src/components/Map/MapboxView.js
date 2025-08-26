import React, { useRef, useEffect, useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { FaToilet, FaWheelchair, FaBaby, FaTransgender, FaDollarSign } from 'react-icons/fa';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import './MapboxView.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const MapboxView = ({ 
  center, 
  restrooms, 
  onMarkerClick, 
  onMapClick,
  showDirections = false,
  destination = null 
}) => {
  const mapRef = useRef();
  const geocoderContainerRef = useRef();
  const directionsRef = useRef();
  const [viewState, setViewState] = useState({
    longitude: center[1],
    latitude: center[0],
    zoom: 14,
    bearing: 0,
    pitch: 0
  });
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Initialize Geocoder
  useEffect(() => {
    if (!mapRef.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapRef.current.getMap(),
      marker: false,
      placeholder: 'Search for places...',
      bbox: [-125, 24, -66, 49], // USA bounding box
      proximity: {
        longitude: viewState.longitude,
        latitude: viewState.latitude
      }
    });

    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.appendChild(geocoder.onAdd(mapRef.current.getMap()));
    }

    geocoder.on('result', (e) => {
      const [lng, lat] = e.result.center;
      setViewState(prev => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 15
      }));
    });

    return () => {
      geocoder.off('result');
    };
  }, [viewState.longitude, viewState.latitude]);

  // Initialize Directions
  useEffect(() => {
    if (!mapRef.current || !showDirections) return;

    const directions = new MapboxDirections({
      accessToken: MAPBOX_TOKEN,
      unit: 'metric',
      profile: 'mapbox/walking',
      controls: {
        profileSwitcher: true,
        instructions: true,
        inputs: false
      }
    });

    directionsRef.current = directions;
    mapRef.current.getMap().addControl(directions, 'top-right');

    if (userLocation && destination) {
      directions.setOrigin([userLocation.lng, userLocation.lat]);
      directions.setDestination([destination.lon, destination.lat]);
    }

    return () => {
      if (mapRef.current?.getMap()?.hasControl(directions)) {
        mapRef.current.getMap().removeControl(directions);
      }
    };
  }, [showDirections, userLocation, destination]);

  // Get user location
  const handleGeolocate = useCallback((e) => {
    setUserLocation({
      lat: e.coords.latitude,
      lng: e.coords.longitude
    });
  }, []);

  // Custom marker for restrooms
  const RestroomMarker = ({ restroom }) => {
    const getMarkerColor = (rating) => {
      if (rating >= 4) return '#27AE60';
      if (rating >= 3) return '#FFD700';
      if (rating >= 2) return '#FF6347';
      return '#E74C3C';
    };

    return (
      <div 
        className="custom-marker"
        style={{ backgroundColor: getMarkerColor(restroom.avg_rating || 0) }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedRestroom(restroom);
          onMarkerClick && onMarkerClick(restroom);
        }}
      >
        <FaToilet className="marker-icon" />
        <div className="marker-pulse"></div>
      </div>
    );
  };

  // Heatmap layer for restroom density
  const heatmapLayer = {
    id: 'restroom-heat',
    type: 'heatmap',
    source: 'restrooms',
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'rating'], 0, 0, 5, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
    }
  };

  // Convert restrooms to GeoJSON for heatmap
  const restroomsGeoJSON = {
    type: 'FeatureCollection',
    features: restrooms.map(r => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [r.lon, r.lat]
      },
      properties: {
        id: r.id,
        name: r.name,
        rating: r.avg_rating || 0
      }
    }))
  };
  
  // Add to MapboxView.js
const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'restrooms',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      100,
      30,
      750,
      40
    ]
  }
};

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'restrooms',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
};

  return (
    <div className="mapbox-container">
      <div ref={geocoderContainerRef} className="geocoder-container"></div>
      
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={onMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Controls */}
        <NavigationControl position="top-left" />
        <GeolocateControl
          position="top-left"
          onGeolocate={handleGeolocate}
          trackUserLocation
          showUserHeading
        />

        {/* Heatmap Layer */}
        <Source id="restrooms" type="geojson" data={restroomsGeoJSON}>
          <Layer {...heatmapLayer} />
        </Source>

        {/* Restroom Markers */}
        {restrooms.map(restroom => (
          <Marker
            key={restroom.id}
            longitude={restroom.lon}
            latitude={restroom.lat}
            anchor="bottom"
          >
            <RestroomMarker restroom={restroom} />
          </Marker>
        ))}

        {/* Popup */}
        {selectedRestroom && (
          <Popup
            longitude={selectedRestroom.lon}
            latitude={selectedRestroom.lat}
            anchor="bottom"
            onClose={() => setSelectedRestroom(null)}
            closeOnClick={false}
            className="restroom-popup"
          >
            <div className="popup-content">
              <h3>{selectedRestroom.name}</h3>
              <div className="popup-rating">
                <span className="stars">🚽 {selectedRestroom.avg_rating?.toFixed(1) || 'N/A'}</span>
                <span className="reviews">({selectedRestroom.review_count || 0} reviews)</span>
              </div>
              <div className="popup-amenities">
                {selectedRestroom.wheelchair_accessible && <FaWheelchair title="Wheelchair Accessible" />}
                {selectedRestroom.baby_changing && <FaBaby title="Baby Changing" />}
                {selectedRestroom.gender_neutral && <FaTransgender title="Gender Neutral" />}
                {!selectedRestroom.requires_fee && <FaDollarSign title="Free" />}
              </div>
              <button 
                className="popup-directions-btn"
                onClick={() => {
                  if (directionsRef.current && userLocation) {
                    directionsRef.current.setDestination([selectedRestroom.lon, selectedRestroom.lat]);
                  }
                }}
              >
                Get Directions
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapboxView;