import { useState, useCallback, useEffect } from 'react';
import { mapStyleService } from '../services/mapStyles';

/**
 * React hook for Google Maps styling functionality
 * Provides easy map theme switching and customization
 */
export const useMapStyles = (initialStyle = 'puper') => {
  const [currentStyle, setCurrentStyle] = useState(initialStyle);
  const [availableStyles, setAvailableStyles] = useState({});

  // Initialize available styles
  useEffect(() => {
    setAvailableStyles(mapStyleService.getAvailableStyles());
  }, []);

  /**
   * Apply a style to the map
   */
  const applyStyle = useCallback((map, styleName) => {
    if (!map || !styleName) return false;

    try {
      mapStyleService.applyStyle(map, styleName);
      setCurrentStyle(styleName);
      return true;
    } catch (error) {
      console.error('Failed to apply map style:', error);
      return false;
    }
  }, []);

  /**
   * Get style configuration by name
   */
  const getStyle = useCallback((styleName) => {
    return mapStyleService.getStyle(styleName);
  }, []);

  /**
   * Get available styles with metadata
   */
  const getAvailableStyles = useCallback(() => {
    return mapStyleService.getAvailableStyles();
  }, []);

  /**
   * Create a custom style
   */
  const createCustomStyle = useCallback((options = {}) => {
    return mapStyleService.createCustomStyle(options);
  }, []);

  /**
   * Apply custom style to map
   */
  const applyCustomStyle = useCallback((map, customStyle) => {
    if (!map || !customStyle) return false;

    try {
      map.setOptions({ styles: customStyle });
      setCurrentStyle('custom');
      return true;
    } catch (error) {
      console.error('Failed to apply custom map style:', error);
      return false;
    }
  }, []);

  /**
   * Switch to Puper branded style
   */
  const applyPuperStyle = useCallback((map) => {
    return applyStyle(map, 'puper');
  }, [applyStyle]);

  /**
   * Switch to psychedelic style
   */
  const applyPsychedelicStyle = useCallback((map) => {
    return applyStyle(map, 'psychedelic');
  }, [applyStyle]);

  /**
   * Switch to night mode
   */
  const applyNightMode = useCallback((map) => {
    return applyStyle(map, 'night');
  }, [applyStyle]);

  /**
   * Switch to clean/minimal style
   */
  const applyCleanStyle = useCallback((map) => {
    return applyStyle(map, 'clean');
  }, [applyStyle]);

  /**
   * Toggle between day and night modes
   */
  const toggleDayNight = useCallback((map) => {
    const newStyle = currentStyle === 'night' ? 'puper' : 'night';
    return applyStyle(map, newStyle);
  }, [currentStyle, applyStyle]);

  /**
   * Apply style based on time of day
   */
  const applyTimeBasedStyle = useCallback((map) => {
    const hour = new Date().getHours();
    const isNightTime = hour < 6 || hour > 20;
    const styleToApply = isNightTime ? 'night' : 'puper';
    return applyStyle(map, styleToApply);
  }, [applyStyle]);

  /**
   * Apply style based on user preference
   */
  const applyPreferredStyle = useCallback((map, userPreference = null) => {
    let styleToApply = 'puper'; // default

    if (userPreference) {
      styleToApply = userPreference;
    } else {
      // Check for system dark mode preference
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      styleToApply = prefersDark ? 'night' : 'puper';
    }

    return applyStyle(map, styleToApply);
  }, [applyStyle]);

  /**
   * Create restroom-focused style
   */
  const createRestroomFocusedStyle = useCallback((baseStyle = 'puper') => {
    return createCustomStyle({
      baseStyle,
      hidePOIs: ['business', 'government', 'school'], // Hide non-essential POIs
      colors: {
        water: '#87CEEB',
        roads: '#ffffff'
      }
    });
  }, [createCustomStyle]);

  /**
   * Get style preview colors for UI
   */
  const getStylePreview = useCallback((styleName) => {
    const previewColors = {
      default: {
        background: '#ffffff',
        water: '#aadaff',
        roads: '#ffffff',
        poi: '#f0f0f0'
      },
      puper: {
        background: '#f5f1e6',
        water: '#87CEEB',
        roads: '#ffffff',
        poi: '#e8dcc0'
      },
      psychedelic: {
        background: '#1a1a2e',
        water: '#0066cc',
        roads: '#16213e',
        poi: '#2d1b69'
      },
      night: {
        background: '#242f3e',
        water: '#17263c',
        roads: '#38414e',
        poi: '#2f3948'
      },
      retro: {
        background: '#ebe3cd',
        water: '#b9d3c2',
        roads: '#f5f1e6',
        poi: '#dfd2ae'
      },
      clean: {
        background: '#f8f9fa',
        water: '#e3f2fd',
        roads: '#ffffff',
        poi: '#f0f0f0'
      }
    };

    return previewColors[styleName] || previewColors.default;
  }, []);

  /**
   * Save user's preferred style to localStorage
   */
  const saveStylePreference = useCallback((styleName) => {
    try {
      localStorage.setItem('puper_map_style', styleName);
    } catch (error) {
      console.warn('Failed to save style preference:', error);
    }
  }, []);

  /**
   * Load user's preferred style from localStorage
   */
  const loadStylePreference = useCallback(() => {
    try {
      return localStorage.getItem('puper_map_style') || 'puper';
    } catch (error) {
      console.warn('Failed to load style preference:', error);
      return 'puper';
    }
  }, []);

  /**
   * Apply saved style preference
   */
  const applySavedStyle = useCallback((map) => {
    const savedStyle = loadStylePreference();
    return applyStyle(map, savedStyle);
  }, [loadStylePreference, applyStyle]);

  return {
    // State
    currentStyle,
    availableStyles,

    // Basic actions
    applyStyle,
    getStyle,
    getAvailableStyles,

    // Custom styles
    createCustomStyle,
    applyCustomStyle,
    createRestroomFocusedStyle,

    // Preset styles
    applyPuperStyle,
    applyPsychedelicStyle,
    applyNightMode,
    applyCleanStyle,

    // Smart styling
    toggleDayNight,
    applyTimeBasedStyle,
    applyPreferredStyle,
    applySavedStyle,

    // Utilities
    getStylePreview,
    saveStylePreference,
    loadStylePreference
  };
};

export default useMapStyles;
