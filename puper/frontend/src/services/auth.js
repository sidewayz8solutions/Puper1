import { supabase } from './supabase';

export const login = async (credentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.username, // Assuming username is email
      password: credentials.password
    });

    if (error) throw error;

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        username: profile?.username || data.user.email,
        displayName: profile?.display_name || data.user.email,
        points: profile?.points || 0,
        level: profile?.level || 1,
        isAdmin: !!profile?.is_admin
      },
      session: data.session
    };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          display_name: userData.displayName || userData.username
        }
      }
    });

    if (error) throw error;

    // Create user profile in users table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          username: userData.username,
          email: userData.email,
          display_name: userData.displayName || userData.username,
          points: 0,
          level: 1
        }]);

      if (profileError) {
        console.warn('Could not create user profile:', profileError);
      }
    }

    return {
      user: {
        id: data.user?.id,
        email: data.user?.email,
        username: userData.username,
        displayName: userData.displayName || userData.username,
        points: 0,
        level: 1,
        isAdmin: false
      },
      session: data.session
    };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Google OAuth sign-in/sign-up
export const loginWithGoogle = async () => {
  try {
    console.log('🔐 Starting Google OAuth flow...');
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('🔄 Redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      console.error('❌ Google OAuth error:', error);
      throw error;
    }

    console.log('✅ Google OAuth initiated successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Google OAuth failed:', error);
    return { success: false, error: error.message || 'Google sign-in failed' };
  }
};

export const getProfile = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    console.log('Getting profile for user:', user.id);

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    const userData = {
      id: user.id,
      email: user.email,
      username: profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      displayName: profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      points: profile?.points || 0,
      level: profile?.level || 1,
      isAdmin: !!profile?.is_admin
    };

    console.log('Profile loaded:', userData);
    return userData;
  } catch (error) {
    console.error('getProfile error:', error);
    throw new Error(error.message || 'Failed to get profile');
  }
};

export const refreshToken = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message || 'Token refresh failed');
  }
};
