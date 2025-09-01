/**
 * Google Maps Custom Styles for Puper
 * Provides themed map styles matching Puper's branding
 */

export const mapStyles = {
  // Default Google Maps style
  default: [],

  // Puper Brown Theme - Main brand style
  puper: [
    {
      elementType: "geometry",
      stylers: [{ color: "#f5f1e6" }] // Light cream background
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#6B4423" }] // Puper brown text
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#6B4423" }]
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#e8dcc0" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8B5A2B" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#c8e6c9" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#6B4423" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#87CEEB" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4682B4" }]
    }
  ],

  // Psychedelic Theme - Vibrant colors
  psychedelic: [
    {
      elementType: "geometry",
      stylers: [{ color: "#1a1a2e" }] // Dark background
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#00ffff" }] // Cyan text
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1a1a2e" }]
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#8a2be2" }] // Purple borders
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#2d1b69" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ff1493" }] // Hot pink
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#00ff41" }] // Neon green
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#16213e" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#8a2be2" }] // Purple highways
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#00ffff" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0066cc" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#00ffff" }]
    }
  ],

  // Night Mode - Dark theme
  night: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#242f3e" }],
    },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],

  // Retro Theme - Vintage look
  retro: [
    { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#f5f1e6" }],
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#c9b2a6" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "geometry.stroke",
      stylers: [{ color: "#dcd2be" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ae9e90" }],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#93817c" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [{ color: "#a5b076" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#447530" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#f5f1e6" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#fdfcf8" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#f8c967" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#e9bc62" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [{ color: "#e98d58" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry.stroke",
      stylers: [{ color: "#db8555" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#806b63" }],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "transit.line",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8f7d77" }],
    },
    {
      featureType: "transit.line",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ebe3cd" }],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#b9d3c2" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#92998d" }],
    },
  ],

  // Clean - Minimal style for focus on restrooms
  clean: [
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.government",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi.school",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      elementType: "geometry",
      stylers: [{ color: "#f8f9fa" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#e3f2fd" }]
    }
  ]
};

export class MapStyleService {
  constructor() {
    this.currentStyle = 'puper';
  }

  /**
   * Get available map styles
   * @returns {Object} Available styles with metadata
   */
  getAvailableStyles() {
    return {
      default: {
        name: 'Default',
        description: 'Standard Google Maps style',
        category: 'standard'
      },
      puper: {
        name: 'Püper Brown',
        description: 'Warm brown theme matching Püper branding',
        category: 'branded'
      },
      psychedelic: {
        name: 'Psychedelic',
        description: 'Vibrant neon colors with dark background',
        category: 'branded'
      },
      night: {
        name: 'Night Mode',
        description: 'Dark theme for low-light viewing',
        category: 'standard'
      },
      retro: {
        name: 'Retro',
        description: 'Vintage-inspired warm tones',
        category: 'themed'
      },
      clean: {
        name: 'Clean',
        description: 'Minimal style focusing on restrooms',
        category: 'functional'
      }
    };
  }

  /**
   * Get style by name
   * @param {string} styleName - Name of the style
   * @returns {Array} Google Maps style array
   */
  getStyle(styleName) {
    return mapStyles[styleName] || mapStyles.default;
  }

  /**
   * Apply style to a map
   * @param {Object} map - Google Maps instance
   * @param {string} styleName - Style to apply
   */
  applyStyle(map, styleName) {
    if (map && mapStyles[styleName]) {
      map.setOptions({ styles: mapStyles[styleName] });
      this.currentStyle = styleName;
    }
  }

  /**
   * Get current style name
   * @returns {string} Current style name
   */
  getCurrentStyle() {
    return this.currentStyle;
  }

  /**
   * Create custom style for specific use cases
   * @param {Object} options - Customization options
   * @returns {Array} Custom style array
   */
  createCustomStyle(options = {}) {
    const baseStyle = this.getStyle(options.baseStyle || 'puper');
    const customizations = [];

    // Hide specific POI types if requested
    if (options.hidePOIs && options.hidePOIs.length > 0) {
      options.hidePOIs.forEach(poiType => {
        customizations.push({
          featureType: `poi.${poiType}`,
          stylers: [{ visibility: "off" }]
        });
      });
    }

    // Custom colors
    if (options.colors) {
      if (options.colors.water) {
        customizations.push({
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: options.colors.water }]
        });
      }
      
      if (options.colors.roads) {
        customizations.push({
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: options.colors.roads }]
        });
      }
    }

    return [...baseStyle, ...customizations];
  }
}

// Create singleton instance
export const mapStyleService = new MapStyleService();

export default mapStyleService;
