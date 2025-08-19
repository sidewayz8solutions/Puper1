import api from './api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get profile');
  }
};

export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/auth/refresh', { token });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Token refresh failed');
  }
};
