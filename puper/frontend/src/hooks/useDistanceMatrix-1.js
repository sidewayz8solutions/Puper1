import { useState, useCallback } from 'react';
import { distanceMatrixService } from '../services/distanceMatrix';

/**
 * React hook for Google Maps Distance Matrix functionality
 * Provides travel times and distances to restrooms
 */
export const useDistanceMatrix = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  /**
   * Calculate distances from user to multiple restrooms
   */
  const calculateDistances = useCallback(async (userLocation, restrooms, options = {}) => {
    if (!userLocation || !restrooms || restrooms.length === 0) {
      setError('Invalid location or restrooms data');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const distanceResults = await distanceMatrixService.calculateDistancesToRestrooms(
        userLocation,
        restrooms,
        {
          travelMode: options.travelMode || 'WALKING',
          unitSystem: options.unitSystem || 'METRIC',
          avoidHighways: options.avoidHighways || false,
          avoidTolls: options.avoidTolls || false
        }
      );

      setResults(distanceResults);
      return distanceResults;

    } catch (err) {
      console.error('Distance calculation error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Find closest restrooms with travel times
   */
  const findClosest = useCallback(async (userLocation, restrooms, limit = 5, options = {}) => {
    if (!userLocation || !restrooms || restrooms.length === 0) {
      setError('Invalid location or restrooms data');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const closestResults = await distanceMatrixService.findClosestRestrooms(
        userLocation,
        restrooms,
        limit,
        options
      );

      setResults(closestResults);
      return closestResults;

    } catch (err) {
      console.error('Closest restrooms error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get travel time to a single restroom
   */
  const getTravelTime = useCallback(async (userLocation, restroom, options = {}) => {
    if (!userLocation || !restroom) {
      setError('Invalid location or restroom data');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await distanceMatrixService.getTravelTimeToRestroom(
        userLocation,
        restroom,
        options
      );

      return result;

    } catch (err) {
      console.error('Travel time error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear results and errors
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  /**
   * Get available travel modes
   */
  const getTravelModes = useCallback(() => {
    return distanceMatrixService.getTravelModes();
  }, []);

  /**
   * Format utilities
   */
  const formatDuration = useCallback((seconds) => {
    return distanceMatrixService.formatDuration(seconds);
  }, []);

  const formatDistance = useCallback((meters) => {
    return distanceMatrixService.formatDistance(meters);
  }, []);

  return {
    // State
    loading,
    error,
    results,

    // Actions
    calculateDistances,
    findClosest,
    getTravelTime,
    clearResults,

    // Utilities
    getTravelModes,
    formatDuration,
    formatDistance
  };
};

export default useDistanceMatrix;
