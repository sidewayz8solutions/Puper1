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
        position: relative;
        width: 45px;
        height: 55px;
        cursor: pointer;
      ">
        <!-- Drop shadow -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 6px;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
        "></div>
        <!-- Main marker -->
        <div style="
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 45px;
          background: #8B4513;
          border: 2px solid #654321;
          border-radius: 50% 50% 50% 0;
          transform: translateX(-50%) rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        "></div>
        <!-- Inner circle -->
        <div style="
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.95);
          border: 1px solid #654321;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        ">
          <span style="font-size: 8px; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); margin-bottom: -2px;">¨</span>
          <span style="font-size: 14px; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">🚽</span>
        </div>
        <!-- Rating badge -->
        <div style="
          position: absolute;
          top: 0;
          right: 0;
          width: 16px;
          height: 16px;
          background: ${getMarkerColor(restroom.avg_rating)};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: bold;
          color: white;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        ">${(restroom.avg_rating || 0).toFixed(1)}</div>
      </div>
    `,
    iconSize: [45, 55],
    iconAnchor: [22.5, 53],
    popupAnchor: [0, -53]
  });

  const renderToilets = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FaToilet
        key={i}
        style={{
          color: i < Math.round(rating) ? '#FFD700' : '#ddd',
          fontSize: '14px',
          marginRight: '2px'
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
        <div style={{
          minWidth: '220px',
          padding: '8px',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            color: '#2d3748',
            fontWeight: '600'
          }}>
            🚽 {restroom.name}
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '12px',
            padding: '8px',
            background: '#f7fafc',
            borderRadius: '8px'
          }}>
            {renderToilets(restroom.avg_rating || 0)}
            <span style={{
              fontSize: '14px',
              marginLeft: '8px',
              color: '#4a5568',
              fontWeight: '500'
            }}>
              {(restroom.avg_rating || 0).toFixed(1)} toilets ({restroom.review_count || 0} reviews)
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px',
            padding: '8px',
            background: '#edf2f7',
            borderRadius: '8px'
          }}>
            {restroom.wheelchair_accessible && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaWheelchair title="Wheelchair Accessible" style={{ color: '#27AE60', fontSize: '16px' }} />
                <span style={{ fontSize: '12px', color: '#27AE60', fontWeight: '500' }}>Accessible</span>
              </div>
            )}
            {restroom.baby_changing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaBaby title="Baby Changing" style={{ color: '#3498DB', fontSize: '16px' }} />
                <span style={{ fontSize: '12px', color: '#3498DB', fontWeight: '500' }}>Baby</span>
              </div>
            )}
            {restroom.gender_neutral && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaTransgender title="Gender Neutral" style={{ color: '#9B59B6', fontSize: '16px' }} />
                <span style={{ fontSize: '12px', color: '#9B59B6', fontWeight: '500' }}>Neutral</span>
              </div>
            )}
          </div>

          {restroom.address && (
            <p style={{
              fontSize: '13px',
              color: '#718096',
              margin: '0',
              padding: '6px 8px',
              background: '#f7fafc',
              borderRadius: '6px',
              borderLeft: '3px solid #667eea'
            }}>
              📍 {restroom.address}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default MapMarker;
