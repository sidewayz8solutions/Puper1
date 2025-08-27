import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register, logout, loginWithGoogle } from '../services/auth';
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
      console.log('Initial session:', session);
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      setSession(session);

      if (event === 'SIGNED_IN' && session) {
        // Handle successful sign in (including OAuth)
        await loadUser();
        toast.success('Successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (session) {
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
      console.log('🔄 Loading user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ Auth error:', userError);
        throw userError;
      }
      if (!user) {
        console.log('❌ No user found');
        throw new Error('No user found');
      }

      console.log('✅ Auth user found:', { id: user.id, email: user.email });

      // Just use the auth user data directly - no database calls
      const userData = {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        points: 0,
        level: 1,
        isAdmin: false
      };

      console.log('✅ User data created:', userData);
      setUser(userData);
    } catch (error) {
      console.error('❌ Load user error:', error);
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

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
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
