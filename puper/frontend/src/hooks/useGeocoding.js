import { useState, useCallback } from 'react';
import { geocodingService } from '../services/geocoding';

/**
 * React hook for Google Maps Geocoding functionality
 * Provides address ↔ coordinates conversion
 */
export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Convert address to coordinates
   */
  const geocodeAddress = useCallback(async (address, options = {}) => {
    if (!address || typeof address !== 'string') {
      setError('Invalid address provided');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const location = await geocodingService.geocodeAddress(address, options);
      setResult(location);
      return location;

    } catch (err) {
      console.error('Geocoding error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Convert coordinates to address
   */
  const reverseGeocode = useCallback(async (lat, lng, options = {}) => {
    if (!geocodingService.validateCoordinates(lat, lng)) {
      setError('Invalid coordinates provided');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const addressInfo = await geocodingService.reverseGeocode({ lat, lng }, options);
      setResult(addressInfo);
      return addressInfo;

    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search for places near a location
   */
  const searchNearby = useCallback(async (query, location, radius = 5000) => {
    if (!query || !location) {
      setError('Invalid search parameters');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResult = await geocodingService.searchNearby(query, location, radius);
      setResult(searchResult);
      return searchResult;

    } catch (err) {
      console.error('Nearby search error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get location suggestions for autocomplete
   */
  const getLocationSuggestions = useCallback(async (input, options = {}) => {
    if (!input || input.length < 3) {
      return [];
    }

    try {
      const suggestions = await geocodingService.getLocationSuggestions(input, options);
      return suggestions;

    } catch (err) {
      console.error('Location suggestions error:', err);
      return [];
    }
  }, []);

  /**
   * Parse address components from result
   */
  const parseAddressComponents = useCallback((addressComponents) => {
    return geocodingService.parseAddressComponents(addressComponents);
  }, []);

  /**
   * Format address for display
   */
  const formatAddress = useCallback((addressComponents, format = 'medium') => {
    return geocodingService.formatAddress(addressComponents, format);
  }, []);

  /**
   * Validate coordinates
   */
  const validateCoordinates = useCallback((lat, lng) => {
    return geocodingService.validateCoordinates(lat, lng);
  }, []);

  /**
   * Clear results and errors
   */
  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    result,

    // Actions
    geocodeAddress,
    reverseGeocode,
    searchNearby,
    getLocationSuggestions,
    clearResults,

    // Utilities
    parseAddressComponents,
    formatAddress,
    validateCoordinates
  };
};

export default useGeocoding;
