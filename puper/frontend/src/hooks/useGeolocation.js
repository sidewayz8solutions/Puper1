import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );
  }, []);

  return { location, loading, error };
};
