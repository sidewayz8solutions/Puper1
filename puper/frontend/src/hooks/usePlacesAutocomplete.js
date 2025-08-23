import { useState, useCallback, useRef, useEffect } from 'react';
import { placesAutocompleteService } from '../services/placesAutocomplete';

/**
 * React hook for Google Places Autocomplete functionality
 * Provides intelligent location search with autocomplete suggestions
 */
export const usePlacesAutocomplete = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null);
  
  // Default options
  const defaultOptions = {
    debounceMs: 300,
    minLength: 2,
    ...options
  };

  /**
   * Get autocomplete predictions with debouncing
   */
  const getAutocompletePredictions = useCallback(async (input, autocompleteOptions = {}) => {
    if (!input || input.length < defaultOptions.minLength) {
      setPredictions([]);
      return [];
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    return new Promise((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);

        try {
          const results = await placesAutocompleteService.getAutocompletePredictions(
            input, 
            autocompleteOptions
          );
          setPredictions(results);
          resolve(results);
        } catch (err) {
          console.error('Autocomplete predictions error:', err);
          setError(err.message);
          setPredictions([]);
          resolve([]);
        } finally {
          setLoading(false);
        }
      }, defaultOptions.debounceMs);
    });
  }, [defaultOptions.debounceMs, defaultOptions.minLength]);

  /**
   * Get detailed place information by place ID
   */
  const getPlaceDetails = useCallback(async (placeId, fields = null) => {
    if (!placeId) {
      setError('Place ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const placeDetails = await placesAutocompleteService.getPlaceDetails(placeId, fields);
      setSelectedPlace(placeDetails);
      return placeDetails;
    } catch (err) {
      console.error('Place details error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search for nearby places
   */
  const searchNearbyPlaces = useCallback(async (location, searchOptions = {}) => {
    if (!location) {
      setError('Location is required');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const places = await placesAutocompleteService.searchNearbyPlaces(location, searchOptions);
      return places;
    } catch (err) {
      console.error('Nearby places search error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get restroom-specific suggestions
   */
  const getRestroomSuggestions = useCallback(async (input, userLocation = null) => {
    if (!input || input.length < defaultOptions.minLength) {
      setPredictions([]);
      return [];
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    return new Promise((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);

        try {
          const results = await placesAutocompleteService.getRestroomSuggestions(input, userLocation);
          setPredictions(results);
          resolve(results);
        } catch (err) {
          console.error('Restroom suggestions error:', err);
          setError(err.message);
          setPredictions([]);
          resolve([]);
        } finally {
          setLoading(false);
        }
      }, defaultOptions.debounceMs);
    });
  }, [defaultOptions.debounceMs, defaultOptions.minLength]);

  /**
   * Find places that likely have restrooms
   */
  const findPlacesWithRestrooms = useCallback(async (location, radius = 2000) => {
    if (!location) {
      setError('Location is required');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const places = await placesAutocompleteService.findPlacesWithRestrooms(location, radius);
      return places;
    } catch (err) {
      console.error('Places with restrooms search error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Select a prediction and get its details
   */
  const selectPrediction = useCallback(async (prediction) => {
    if (!prediction || !prediction.placeId) {
      setError('Invalid prediction');
      return null;
    }

    try {
      const placeDetails = await getPlaceDetails(prediction.placeId);
      return placeDetails;
    } catch (err) {
      console.error('Error selecting prediction:', err);
      return null;
    }
  }, [getPlaceDetails]);

  /**
   * Clear all data
   */
  const clearData = useCallback(() => {
    setPredictions([]);
    setSelectedPlace(null);
    setError(null);
    
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Generate new session token
   */
  const generateNewSessionToken = useCallback(() => {
    placesAutocompleteService.generateNewSessionToken();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    loading,
    error,
    predictions,
    selectedPlace,

    // Actions
    getAutocompletePredictions,
    getPlaceDetails,
    searchNearbyPlaces,
    getRestroomSuggestions,
    findPlacesWithRestrooms,
    selectPrediction,
    clearData,
    generateNewSessionToken
  };
};

export default usePlacesAutocomplete;
