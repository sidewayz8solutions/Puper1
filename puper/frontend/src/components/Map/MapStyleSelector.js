import React, { useState, useEffect } from 'react';
import { FaPalette, FaCheck, FaEye } from 'react-icons/fa';
import { mapStyleService } from '../../services/mapStyles';
import './MapStyleSelector.css';

const MapStyleSelector = ({ 
  map, 
  onStyleChange, 
  initialStyle = 'puper',
  showPreview = true,
  className = ""
}) => {
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [isOpen, setIsOpen] = useState(false);
  const [availableStyles, setAvailableStyles] = useState({});

  useEffect(() => {
    setAvailableStyles(mapStyleService.getAvailableStyles());
  }, []);

  useEffect(() => {
    if (map && selectedStyle) {
      mapStyleService.applyStyle(map, selectedStyle);
      if (onStyleChange) {
        onStyleChange(selectedStyle);
      }
    }
  }, [map, selectedStyle, onStyleChange]);

  const handleStyleSelect = (styleName) => {
    setSelectedStyle(styleName);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getStyleIcon = (category) => {
    switch (category) {
      case 'branded':
        return '🎨';
      case 'standard':
        return '🗺️';
      case 'themed':
        return '🎭';
      case 'functional':
        return '🔧';
      default:
        return '📍';
    }
  };

  const groupedStyles = Object.entries(availableStyles).reduce((groups, [key, style]) => {
    const category = style.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push({ key, ...style });
    return groups;
  }, {});

  return (
    <div className={`map-style-selector ${className}`}>
      {/* Style Selector Button */}
      <button 
        className="style-selector-button"
        onClick={toggleDropdown}
        title="Change map style"
      >
        <FaPalette className="selector-icon" />
        <span className="selector-text">
          {availableStyles[selectedStyle]?.name || 'Map Style'}
        </span>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="style-dropdown">
          <div className="dropdown-header">
            <FaPalette className="header-icon" />
            <span>Choose Map Style</span>
          </div>

          <div className="styles-container">
            {Object.entries(groupedStyles).map(([category, styles]) => (
              <div key={category} className="style-category">
                <div className="category-header">
                  <span className="category-icon">{getStyleIcon(category)}</span>
                  <span className="category-name">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </div>

                <div className="category-styles">
                  {styles.map((style) => (
                    <div
                      key={style.key}
                      className={`style-option ${selectedStyle === style.key ? 'selected' : ''}`}
                      onClick={() => handleStyleSelect(style.key)}
                    >
                      <div className="style-info">
                        <div className="style-name">{style.name}</div>
                        <div className="style-description">{style.description}</div>
                      </div>

                      {showPreview && (
                        <div className="style-preview">
                          <StylePreview styleName={style.key} />
                        </div>
                      )}

                      {selectedStyle === style.key && (
                        <div className="selected-indicator">
                          <FaCheck />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="dropdown-footer">
            <button 
              className="footer-action"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="dropdown-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Style Preview Component
const StylePreview = ({ styleName }) => {
  const getPreviewColors = (styleName) => {
    switch (styleName) {
      case 'puper':
        return {
          background: '#f5f1e6',
          water: '#87CEEB',
          roads: '#ffffff',
          poi: '#e8dcc0'
        };
      case 'psychedelic':
        return {
          background: '#1a1a2e',
          water: '#0066cc',
          roads: '#16213e',
          poi: '#2d1b69'
        };
      case 'night':
        return {
          background: '#242f3e',
          water: '#17263c',
          roads: '#38414e',
          poi: '#2f3948'
        };
      case 'retro':
        return {
          background: '#ebe3cd',
          water: '#b9d3c2',
          roads: '#f5f1e6',
          poi: '#dfd2ae'
        };
      case 'clean':
        return {
          background: '#f8f9fa',
          water: '#e3f2fd',
          roads: '#ffffff',
          poi: '#f0f0f0'
        };
      default:
        return {
          background: '#ffffff',
          water: '#aadaff',
          roads: '#ffffff',
          poi: '#f0f0f0'
        };
    }
  };

  const colors = getPreviewColors(styleName);

  return (
    <div className="style-preview-container">
      <svg width="40" height="30" viewBox="0 0 40 30">
        {/* Background */}
        <rect width="40" height="30" fill={colors.background} />
        
        {/* Water */}
        <path 
          d="M0 20 Q10 15 20 20 T40 20 L40 30 L0 30 Z" 
          fill={colors.water} 
        />
        
        {/* Roads */}
        <rect x="15" y="0" width="2" height="30" fill={colors.roads} />
        <rect x="0" y="10" width="40" height="2" fill={colors.roads} />
        
        {/* POI */}
        <circle cx="8" cy="8" r="3" fill={colors.poi} />
        <circle cx="30" cy="15" r="2" fill={colors.poi} />
      </svg>
    </div>
  );
};

export default MapStyleSelector;
