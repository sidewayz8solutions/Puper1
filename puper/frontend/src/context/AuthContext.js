import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.username || session.user.email?.split('@')[0]
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.username || session.user.email?.split('@')[0]
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ username, password }) => {
    try {
      setLoading(true);
      // Try login with email first, then username
      const email = username.includes('@') ? username : `${username}@puper.app`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        // If failed, try with username as email
        const { data: altData, error: altError } = await supabase.auth.signInWithPassword({
          email: username,
          password: password
        });
        
        if (altError) {
          throw error || altError;
        }
        
        if (altData?.user) {
          toast.success('Login successful!');
          return { success: true, user: altData.user };
        }
      }
      
      if (data?.user) {
        toast.success('Login successful!');
        return { success: true, user: data.user };
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, displayName, username }) => {
    try {
      setLoading(true);
      
      // Create a proper email if not provided
      const userEmail = email || `${username.replace(/[^a-zA-Z0-9]/g, '')}@puper.app`;
      
      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password: password,
        options: {
          data: {
            display_name: displayName || username,
            username: username
          },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // Check if email confirmation is required
      if (data.user && data.session) {
        // User is signed up and logged in
        toast.success('Account created successfully!');
        return { success: true, user: data.user };
      } else if (data.user) {
        // User needs to confirm email
        toast.success('Please check your email to confirm your account!');
        return { success: true, needsConfirmation: true };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
      
      // Google OAuth will redirect, so no need to update state here
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    checkUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
