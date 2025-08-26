import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { FaToilet, FaWheelchair, FaBaby, FaTransgender } from 'react-icons/fa';
import L from 'leaflet';

const MapMarker = ({ restroom, onClick }) => {
  const getMarkerColor = (rating) => {
    if (rating >= 4) return '#27AE60';
    if (rating >= 3) return '#FFD700';
    if (rating >= 2) return '#FF6347';
    return '#E74C3C';
  };

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${getMarkerColor(restroom.avg_rating)};
        width: 30px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        cursor: pointer;
      ">
        <span style="transform: rotate(45deg); font-size: 16px; color: white;">🚽</span>
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  });

  const renderToilets = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FaToilet
        key={i}
        style={{
          color: i < Math.round(rating) ? 'var(--psychedelic-yellow)' : '#ddd',
          fontSize: '12px'
        }}
      />
    ));
  };

  return (
    <Marker 
      position={[restroom.lat, restroom.lon]} 
      icon={customIcon}
      eventHandlers={{
        click: () => onClick(restroom)
      }}
    >
      <Popup>
        <div style={{ minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{restroom.name}</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            {renderToilets(restroom.avg_rating || 0)}
            <span style={{ fontSize: '12px', marginLeft: '4px' }}>
              ({restroom.review_count || 0} reviews)
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {restroom.wheelchair_accessible && (
              <FaWheelchair title="Wheelchair Accessible" style={{ color: '#27AE60' }} />
            )}
            {restroom.baby_changing && (
              <FaBaby title="Baby Changing" style={{ color: '#3498DB' }} />
            )}
            {restroom.gender_neutral && (
              <FaTransgender title="Gender Neutral" style={{ color: '#9B59B6' }} />
            )}
          </div>
          
          {restroom.address && (
            <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
              {restroom.address}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default MapMarker;
