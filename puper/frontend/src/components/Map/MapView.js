import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import './MapView.css';

const MapView = ({ center, restrooms, onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, 14);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }
  }, [center]);

  useEffect(() => {
    if (mapInstanceRef.current && restrooms) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      restrooms.forEach(restroom => {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="marker-pin" style="background: ${getMarkerColor(restroom.avg_rating)}">
              <span class="marker-icon">🚽</span>
            </div>
          `,
          iconSize: [30, 40],
          iconAnchor: [15, 40]
        });

        const marker = L.marker([restroom.lat, restroom.lon], { icon })
          .addTo(mapInstanceRef.current)
          .on('click', () => onMarkerClick(restroom));

        markersRef.current.push(marker);
      });
    }
  }, [restrooms, onMarkerClick]);

  const getMarkerColor = (rating) => {
    if (rating >= 4) return 'var(--success-green)';
    if (rating >= 3) return 'var(--psychedelic-yellow)';
    if (rating >= 2) return 'var(--psychedelic-orange)';
    return 'var(--danger-red)';
  };

  return <div ref={mapRef} className="map-view" />;
};

export default MapView;
