/**
 * Google Maps Click Events Service for Puper
 * Handles all map interaction events for restroom management
 */

export class MapClickEventsService {
  constructor() {
    this.listeners = new Map();
    this.debounceTimers = new Map();
    this.longPressTimer = null;
    this.longPressDelay = 500; // ms
    this.clickDebounceDelay = 300; // ms
  }

  /**
   * Initialize click events for a map
   * @param {Object} map - Google Maps instance
   * @param {Object} options - Event configuration
   */
  initializeMapEvents(map, options = {}) {
    if (!map) return;

    const config = {
      enableMapClick: true,
      enableMarkerClick: true,
      enableRightClick: true,
      enableDoubleClick: true,
      enableLongPress: true,
      debounceClicks: true,
      ...options
    };

    // Map click event
    if (config.enableMapClick) {
      this.addMapClickListener(map, config.onMapClick);
    }

    // Right-click context menu
    if (config.enableRightClick) {
      this.addRightClickListener(map, config.onRightClick);
    }

    // Double-click zoom
    if (config.enableDoubleClick) {
      this.addDoubleClickListener(map, config.onDoubleClick);
    }

    // Long press for mobile
    if (config.enableLongPress) {
      this.addLongPressListener(map, config.onLongPress);
    }

    // Center changed event
    if (config.onCenterChanged) {
      this.addCenterChangedListener(map, config.onCenterChanged);
    }

    // Zoom changed event
    if (config.onZoomChanged) {
      this.addZoomChangedListener(map, config.onZoomChanged);
    }

    return this;
  }

  /**
   * Add map click listener
   */
  addMapClickListener(map, callback) {
    const listener = map.addListener('click', (event) => {
      const clickData = this.extractClickData(event);
      
      if (callback) {
        this.debounceCallback('mapClick', () => {
          callback(clickData, event);
        });
      }
    });

    this.listeners.set('mapClick', listener);
    return listener;
  }

  /**
   * Add marker click listener
   */
  addMarkerClickListener(marker, callback, markerData = null) {
    const listener = marker.addListener('click', (event) => {
      const clickData = {
        ...this.extractClickData(event),
        marker: marker,
        markerData: markerData
      };

      if (callback) {
        this.debounceCallback(`marker_${marker.get('id') || 'unknown'}`, () => {
          callback(clickData, event);
        });
      }
    });

    return listener;
  }

  /**
   * Add right-click context menu listener
   */
  addRightClickListener(map, callback) {
    const listener = map.addListener('rightclick', (event) => {
      const clickData = this.extractClickData(event);
      
      if (callback) {
        callback(clickData, event);
      }
    });

    this.listeners.set('rightClick', listener);
    return listener;
  }

  /**
   * Add double-click listener
   */
  addDoubleClickListener(map, callback) {
    const listener = map.addListener('dblclick', (event) => {
      const clickData = this.extractClickData(event);
      
      if (callback) {
        callback(clickData, event);
      } else {
        // Default behavior: zoom in
        map.setZoom(map.getZoom() + 2);
        map.setCenter(event.latLng);
      }
    });

    this.listeners.set('doubleClick', listener);
    return listener;
  }

  /**
   * Add long press listener for mobile
   */
  addLongPressListener(map, callback) {
    let startTime;
    let startPosition;

    const mouseDownListener = map.addListener('mousedown', (event) => {
      startTime = Date.now();
      startPosition = event.latLng;
      
      this.longPressTimer = setTimeout(() => {
        const clickData = this.extractClickData(event);
        if (callback) {
          callback(clickData, event);
        }
      }, this.longPressDelay);
    });

    const mouseUpListener = map.addListener('mouseup', () => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    });

    this.listeners.set('longPressDown', mouseDownListener);
    this.listeners.set('longPressUp', mouseUpListener);
    
    return { mouseDownListener, mouseUpListener };
  }

  /**
   * Add center changed listener
   */
  addCenterChangedListener(map, callback) {
    const listener = map.addListener('center_changed', () => {
      const center = map.getCenter();
      const centerData = {
        lat: center.lat(),
        lng: center.lng(),
        zoom: map.getZoom()
      };

      if (callback) {
        this.debounceCallback('centerChanged', () => {
          callback(centerData);
        });
      }
    });

    this.listeners.set('centerChanged', listener);
    return listener;
  }

  /**
   * Add zoom changed listener
   */
  addZoomChangedListener(map, callback) {
    const listener = map.addListener('zoom_changed', () => {
      const zoomData = {
        zoom: map.getZoom(),
        center: {
          lat: map.getCenter().lat(),
          lng: map.getCenter().lng()
        }
      };

      if (callback) {
        this.debounceCallback('zoomChanged', () => {
          callback(zoomData);
        });
      }
    });

    this.listeners.set('zoomChanged', listener);
    return listener;
  }

  /**
   * Extract useful data from click event
   */
  extractClickData(event) {
    const latLng = event.latLng;
    
    return {
      lat: latLng.lat(),
      lng: latLng.lng(),
      coordinates: `${latLng.lat()},${latLng.lng()}`,
      timestamp: Date.now(),
      pixel: event.pixel || null,
      domEvent: event.domEvent || null
    };
  }

  /**
   * Debounce callback execution
   */
  debounceCallback(key, callback) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      callback();
      this.debounceTimers.delete(key);
    }, this.clickDebounceDelay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Create restroom marker with click events
   */
  createRestroomMarker(map, restroom, options = {}) {
    const marker = new window.google.maps.Marker({
      position: { lat: restroom.lat, lng: restroom.lon || restroom.lng },
      map: map,
      title: restroom.name,
      icon: options.icon || {
        url: '/icons/restroom-marker.png',
        scaledSize: new window.google.maps.Size(32, 32)
      },
      ...options.markerOptions
    });

    // Add click listener for restroom details
    this.addMarkerClickListener(marker, options.onMarkerClick, restroom);

    // Add hover effects
    if (options.enableHover) {
      marker.addListener('mouseover', () => {
        if (options.onMarkerHover) {
          options.onMarkerHover(restroom, 'enter');
        }
      });

      marker.addListener('mouseout', () => {
        if (options.onMarkerHover) {
          options.onMarkerHover(restroom, 'leave');
        }
      });
    }

    return marker;
  }

  /**
   * Pan to location with animation
   */
  panToLocation(map, location, zoom = null) {
    if (!map || !location) return;

    map.panTo(location);
    
    if (zoom !== null) {
      setTimeout(() => {
        map.setZoom(zoom);
      }, 300);
    }
  }

  /**
   * Auto-pan back to marker after delay (like in the example)
   */
  autoPanToMarker(map, marker, delay = 3000) {
    setTimeout(() => {
      if (marker && marker.getPosition) {
        map.panTo(marker.getPosition());
      }
    }, delay);
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.listeners.forEach(listener => {
      if (listener && listener.remove) {
        listener.remove();
      }
    });
    this.listeners.clear();

    // Clear timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Remove specific listener
   */
  removeListener(key) {
    const listener = this.listeners.get(key);
    if (listener && listener.remove) {
      listener.remove();
      this.listeners.delete(key);
    }
  }

  /**
   * Get distance between two points
   */
  getDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

// Create singleton instance
export const mapClickEventsService = new MapClickEventsService();

export default mapClickEventsService;
