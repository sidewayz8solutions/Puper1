import { useState, useCallback, useRef, useEffect } from 'react';
import { mapClickEventsService } from '../services/mapClickEvents';

/**
 * React hook for Google Maps click events
 * Provides easy map interaction handling for Puper
 */
export const useMapClickEvents = (options = {}) => {
  const [clickData, setClickData] = useState(null);
  const [selectedRestroom, setSelectedRestroom] = useState(null);
  const [isAddingRestroom, setIsAddingRestroom] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  // Default configuration
  const config = {
    enableMapClick: true,
    enableMarkerClick: true,
    enableRightClick: true,
    enableDoubleClick: true,
    enableLongPress: true,
    debounceClicks: true,
    ...options
  };

  /**
   * Initialize map with click events
   */
  const initializeMap = useCallback((map) => {
    if (!map) return;

    mapRef.current = map;

    mapClickEventsService.initializeMapEvents(map, {
      ...config,
      onMapClick: handleMapClick,
      onRightClick: handleRightClick,
      onDoubleClick: handleDoubleClick,
      onLongPress: handleLongPress,
      onCenterChanged: handleCenterChanged,
      onZoomChanged: handleZoomChanged
    });
  }, [config]);

  /**
   * Handle map click events
   */
  const handleMapClick = useCallback((clickData, event) => {
    setClickData(clickData);
    setContextMenu(null); // Close context menu

    if (config.onMapClick) {
      config.onMapClick(clickData, event);
    }

    // If in add restroom mode, trigger add restroom
    if (isAddingRestroom && config.onAddRestroom) {
      config.onAddRestroom(clickData);
      setIsAddingRestroom(false);
    }
  }, [config, isAddingRestroom]);

  /**
   * Handle marker click events
   */
  const handleMarkerClick = useCallback((clickData, event) => {
    setSelectedRestroom(clickData.markerData);
    setContextMenu(null);

    if (config.onMarkerClick) {
      config.onMarkerClick(clickData, event);
    }

    // Default behavior: zoom to marker
    if (mapRef.current && !config.onMarkerClick) {
      mapRef.current.setZoom(15);
      mapRef.current.setCenter({ lat: clickData.lat, lng: clickData.lng });
    }
  }, [config]);

  /**
   * Handle right-click context menu
   */
  const handleRightClick = useCallback((clickData, event) => {
    event.domEvent?.preventDefault();
    
    setContextMenu({
      x: event.domEvent?.clientX || 0,
      y: event.domEvent?.clientY || 0,
      location: { lat: clickData.lat, lng: clickData.lng }
    });

    if (config.onRightClick) {
      config.onRightClick(clickData, event);
    }
  }, [config]);

  /**
   * Handle double-click events
   */
  const handleDoubleClick = useCallback((clickData, event) => {
    if (config.onDoubleClick) {
      config.onDoubleClick(clickData, event);
    } else if (mapRef.current) {
      // Default: zoom in
      mapRef.current.setZoom(mapRef.current.getZoom() + 2);
      mapRef.current.setCenter({ lat: clickData.lat, lng: clickData.lng });
    }
  }, [config]);

  /**
   * Handle long press events (mobile)
   */
  const handleLongPress = useCallback((clickData, event) => {
    // Show context menu on long press
    setContextMenu({
      x: event.domEvent?.clientX || 0,
      y: event.domEvent?.clientY || 0,
      location: { lat: clickData.lat, lng: clickData.lng },
      isLongPress: true
    });

    if (config.onLongPress) {
      config.onLongPress(clickData, event);
    }
  }, [config]);

  /**
   * Handle center changed events
   */
  const handleCenterChanged = useCallback((centerData) => {
    if (config.onCenterChanged) {
      config.onCenterChanged(centerData);
    }
  }, [config]);

  /**
   * Handle zoom changed events
   */
  const handleZoomChanged = useCallback((zoomData) => {
    if (config.onZoomChanged) {
      config.onZoomChanged(zoomData);
    }
  }, [config]);

  /**
   * Add restroom marker to map
   */
  const addRestroomMarker = useCallback((restroom, markerOptions = {}) => {
    if (!mapRef.current) return null;

    const marker = mapClickEventsService.createRestroomMarker(
      mapRef.current,
      restroom,
      {
        ...markerOptions,
        onMarkerClick: handleMarkerClick,
        onMarkerHover: config.onMarkerHover
      }
    );

    markersRef.current.set(restroom.id, marker);
    return marker;
  }, [handleMarkerClick, config.onMarkerHover]);

  /**
   * Remove restroom marker from map
   */
  const removeRestroomMarker = useCallback((restroomId) => {
    const marker = markersRef.current.get(restroomId);
    if (marker) {
      marker.setMap(null);
      markersRef.current.delete(restroomId);
    }
  }, []);

  /**
   * Clear all markers
   */
  const clearAllMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current.clear();
  }, []);

  /**
   * Pan to restroom location
   */
  const panToRestroom = useCallback((restroom, zoom = 15) => {
    if (!mapRef.current) return;

    const location = { lat: restroom.lat, lng: restroom.lon || restroom.lng };
    mapClickEventsService.panToLocation(mapRef.current, location, zoom);
  }, []);

  /**
   * Start add restroom mode
   */
  const startAddRestroomMode = useCallback(() => {
    setIsAddingRestroom(true);
    setContextMenu(null);
  }, []);

  /**
   * Cancel add restroom mode
   */
  const cancelAddRestroomMode = useCallback(() => {
    setIsAddingRestroom(false);
  }, []);

  /**
   * Close context menu
   */
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  /**
   * Get marker for restroom
   */
  const getRestroomMarker = useCallback((restroomId) => {
    return markersRef.current.get(restroomId);
  }, []);

  /**
   * Highlight restroom marker
   */
  const highlightRestroom = useCallback((restroomId, highlight = true) => {
    const marker = markersRef.current.get(restroomId);
    if (marker) {
      const icon = marker.getIcon();
      if (typeof icon === 'object') {
        marker.setIcon({
          ...icon,
          scale: highlight ? 1.2 : 1.0,
          strokeWeight: highlight ? 3 : 1
        });
      }
    }
  }, []);

  /**
   * Get distance from click to restroom
   */
  const getDistanceToRestroom = useCallback((clickLocation, restroom) => {
    const restroomLocation = { 
      lat: restroom.lat, 
      lng: restroom.lon || restroom.lng 
    };
    return mapClickEventsService.getDistance(clickLocation, restroomLocation);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mapClickEventsService.removeAllListeners();
      clearAllMarkers();
    };
  }, [clearAllMarkers]);

  return {
    // State
    clickData,
    selectedRestroom,
    isAddingRestroom,
    contextMenu,

    // Map initialization
    initializeMap,

    // Marker management
    addRestroomMarker,
    removeRestroomMarker,
    clearAllMarkers,
    getRestroomMarker,
    highlightRestroom,

    // Navigation
    panToRestroom,

    // Interaction modes
    startAddRestroomMode,
    cancelAddRestroomMode,
    closeContextMenu,

    // Utilities
    getDistanceToRestroom,

    // State setters
    setSelectedRestroom,
    setIsAddingRestroom
  };
};

export default useMapClickEvents;
