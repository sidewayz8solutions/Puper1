import { useState, useCallback, useRef } from 'react';
import { directionsService } from '../services/directions';

/**
 * React hook for Google Maps Directions functionality
 * Provides turn-by-turn directions to restrooms
 */
export const useDirections = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  
  const mapRef = useRef(null);
  const panelRef = useRef(null);

  /**
   * Calculate route between two points
   */
  const calculateRoute = useCallback(async (origin, destination, options = {}) => {
    if (!origin || !destination) {
      setError('Origin and destination are required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await directionsService.calculateRoute(origin, destination, options);
      setDirections(result);
      setActiveRoute(result);
      return result;

    } catch (err) {
      console.error('Directions calculation error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get directions to nearest restroom
   */
  const getDirectionsToNearestRestroom = useCallback(async (userLocation, restrooms, options = {}) => {
    if (!userLocation || !restrooms || restrooms.length === 0) {
      setError('Invalid location or restrooms data');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await directionsService.getDirectionsToNearestRestroom(
        userLocation, 
        restrooms, 
        options
      );
      setDirections(result);
      setActiveRoute(result);
      return result;

    } catch (err) {
      console.error('Nearest restroom directions error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get multiple route options with different travel modes
   */
  const getMultipleRouteOptions = useCallback(async (origin, destination) => {
    if (!origin || !destination) {
      setError('Origin and destination are required');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const routes = await directionsService.getMultipleRouteOptions(origin, destination);
      setRouteOptions(routes);
      
      // Set the first valid route as active
      if (routes.length > 0) {
        setActiveRoute(routes[0]);
        setDirections(routes[0]);
      }
      
      return routes;

    } catch (err) {
      console.error('Multiple routes error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Display directions on map and panel
   */
  const displayDirections = useCallback((map, panel) => {
    if (directions && map) {
      mapRef.current = map;
      panelRef.current = panel;
      directionsService.displayDirections(map, panel, directions);
    }
  }, [directions]);

  /**
   * Clear directions from map and panel
   */
  const clearDirections = useCallback(() => {
    directionsService.clearDirections();
    setDirections(null);
    setActiveRoute(null);
    setRouteOptions([]);
    setError(null);
  }, []);

  /**
   * Switch to a different route option
   */
  const switchRoute = useCallback((routeIndex) => {
    if (routeOptions[routeIndex]) {
      const selectedRoute = routeOptions[routeIndex];
      setActiveRoute(selectedRoute);
      setDirections(selectedRoute);
      
      // Update display if map and panel are available
      if (mapRef.current) {
        directionsService.displayDirections(mapRef.current, panelRef.current, selectedRoute);
      }
    }
  }, [routeOptions]);

  /**
   * Get quick directions to a specific restroom
   */
  const getQuickDirections = useCallback(async (userLocation, restroom, travelMode = 'WALKING') => {
    const destination = {
      lat: restroom.lat,
      lng: restroom.lon || restroom.lng
    };

    const result = await calculateRoute(userLocation, destination, { 
      travelMode: window.google.maps?.TravelMode[travelMode] || 'WALKING'
    });

    if (result) {
      return {
        ...result,
        restroom,
        destinationName: restroom.name
      };
    }

    return null;
  }, [calculateRoute]);

  /**
   * Format utilities
   */
  const formatDuration = useCallback((duration) => {
    return directionsService.formatDuration(duration);
  }, []);

  const formatDistance = useCallback((distance) => {
    return directionsService.formatDistance(distance);
  }, []);

  const getTravelModeIcon = useCallback((travelMode) => {
    return directionsService.getTravelModeIcon(travelMode);
  }, []);

  /**
   * Get summary of current route
   */
  const getRouteSummary = useCallback(() => {
    if (!activeRoute || !activeRoute.summary) return null;

    return {
      distance: activeRoute.summary.distance,
      duration: activeRoute.summary.duration,
      startAddress: activeRoute.summary.startAddress,
      endAddress: activeRoute.summary.endAddress,
      stepCount: activeRoute.steps?.length || 0,
      travelMode: activeRoute.travelMode
    };
  }, [activeRoute]);

  /**
   * Get step-by-step instructions
   */
  const getStepByStepInstructions = useCallback(() => {
    if (!activeRoute || !activeRoute.steps) return [];

    return activeRoute.steps.map(step => ({
      stepNumber: step.stepNumber,
      instruction: step.plainTextInstructions,
      htmlInstruction: step.htmlInstructions,
      distance: step.distance,
      duration: step.duration,
      maneuver: step.maneuver
    }));
  }, [activeRoute]);

  return {
    // State
    loading,
    error,
    directions,
    routeOptions,
    activeRoute,

    // Actions
    calculateRoute,
    getDirectionsToNearestRestroom,
    getMultipleRouteOptions,
    getQuickDirections,
    displayDirections,
    clearDirections,
    switchRoute,

    // Utilities
    formatDuration,
    formatDistance,
    getTravelModeIcon,
    getRouteSummary,
    getStepByStepInstructions
  };
};

export default useDirections;
