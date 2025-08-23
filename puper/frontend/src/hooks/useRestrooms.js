import { useQuery } from 'react-query';
import { getNearbyRestrooms } from '../services/restrooms';

export const useRestrooms = (lat, lon, filters = {}) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['restrooms', lat, lon, filters],
    () => getNearbyRestrooms(lat, lon, filters),
    {
      enabled: !!lat && !!lon,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    }
  );

  return {
    restrooms: data || [],
    loading: isLoading,
    error,
    refetch
  };
};
