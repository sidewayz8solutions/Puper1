import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, logout, getProfile } from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const { token, user } = await login(credentials);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const { token, user } = await register(userData);
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser: loadUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
