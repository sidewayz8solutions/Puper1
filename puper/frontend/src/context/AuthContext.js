import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, logout, getProfile, loginWithGoogle } from '../services/auth';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUser();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const { user, session } = await login(credentials);
      setUser(user);
      setSession(session);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const { user, session } = await register(userData);
      setUser(user);
      setSession(session);
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
    refreshUser: loadUser,
    loginWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
