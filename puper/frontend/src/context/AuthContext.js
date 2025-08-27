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
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 Initial session check:', { session: !!session, userId: session?.user?.id, error });
      setSession(session);
      if (session) {
        console.log('✅ Found existing session, loading user...');
        loadUser();
      } else {
        console.log('❌ No existing session found');
        setLoading(false);
      }
    }).catch(err => {
      console.error('❌ Failed to get initial session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });
      setSession(session);

      if (event === 'SIGNED_IN' && session) {
        console.log('✅ SIGNED_IN event - loading user profile...');
        await loadUser();
        toast.success('Successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 SIGNED_OUT event');
        setUser(null);
        setLoading(false);
      } else if (session) {
        console.log('🔄 Session exists, loading user...');
        loadUser();
      } else {
        console.log('❌ No session in auth state change');
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async () => {
    try {
      console.log('👤 Loading user profile...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ Error getting user:', userError);
        throw userError;
      }
      if (!user) {
        console.error('❌ No user found in session');
        throw new Error('No user found');
      }

      console.log('✅ Got user from Supabase:', { id: user.id, email: user.email });

      // Try to get user profile from our users table
      let userData;
      try {
        userData = await getProfile();
      } catch (profileError) {
        console.log('No profile found, creating one for OAuth user');

        // For OAuth users, create a profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            points: 0,
            level: 1
          }]);

        if (insertError) {
          console.warn('Could not create user profile:', insertError);
        }

        // Return basic user data
        userData = {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          points: 0,
          level: 1,
          isAdmin: false
        };
      }

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
