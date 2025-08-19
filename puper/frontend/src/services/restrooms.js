import api from './api';

export const getNearbyRestrooms = async (lat, lon, filters = {}) => {
  const params = new URLSearchParams({
    lat,
    lon,
    radius: filters.radius || 5000,
    ...filters
  });
  const response = await api.get(`/restrooms?${params}`);
  return response.data;
};

export const getRestroom = async (id) => {
  const response = await api.get(`/restrooms/${id}`);
  return response.data;
};

export const createRestroom = async (data) => {
  const response = await api.post('/restrooms', data);
  return response.data;
};

export const searchAlongRoute = async (polyline, maxDistance = 1000) => {
  const response = await api.post('/restrooms/route', { polyline, maxDistance });
  return response.data;
};

export const reportRestroom = async (id, data) => {
  const response = await api.post(`/restrooms/${id}/report`, data);
  return response.data;
};
