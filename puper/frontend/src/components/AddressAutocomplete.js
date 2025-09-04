import React, { useRef, useEffect, useState } from 'react';
import { initGoogleMaps } from '../services/googleMaps';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Search restrooms or enter address...",
  className = "search-input",
  onKeyPress
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await initGoogleMaps();
        
        if (inputRef.current && window.google && window.google.maps && window.google.maps.places) {
          // Create autocomplete instance
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['address'],
              componentRestrictions: { country: 'us' }, // Restrict to US addresses
              fields: ['formatted_address', 'geometry', 'name', 'place_id']
            }
          );

          // Add place changed listener
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            
            if (place.geometry) {
              const addressData = {
                address: place.formatted_address || place.name,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                placeId: place.place_id
              };
              
              // Update input value
              if (onChange) {
                onChange({ target: { value: addressData.address } });
              }
              
              // Notify parent component
              if (onPlaceSelect) {
                onPlaceSelect(addressData);
              }
            }
          });

          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to initialize Google Places Autocomplete:', error);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, onPlaceSelect]);

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyPress = (e) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        border: 'none',
        borderRadius: 'var(--radius)',
        background: 'rgba(255, 255, 255, 0.9)',
        color: 'var(--dark-brown)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'var(--transition)'
      }}
    />
  );
};

export default AddressAutocomplete;
