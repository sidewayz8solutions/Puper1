import { supabase } from './supabase';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: userData.displayName || '',
            bio: userData.bio || '',
            avatar_url: userData.avatarUrl || null
          }
        }
      });

      if (error) throw error;

      // Create user profile in our users table
      if (data.user) {
        await this.createUserProfile(data.user, userData);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      this.notifyListeners();
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: null, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.notifyListeners();
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error.message };
    }
  }

  // Create user profile in our users table
  async createUserProfile(user, additionalData = {}) {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          display_name: additionalData.displayName || user.user_metadata?.display_name || '',
          bio: additionalData.bio || user.user_metadata?.bio || '',
          avatar_url: additionalData.avatarUrl || user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          level: 1,
          points: 0,
          reviews_count: 0,
          restrooms_added: 0
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Create user profile error:', error);
      return { error: error.message };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { profile: null, error: error.message };
    }
  }

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { profile: null, error: error.message };
    }
  }

  // Initialize auth state
  async initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        this.currentUser = session.user;
        this.notifyListeners();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          this.currentUser = session.user;
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
        }
        this.notifyListeners();
      });

      return { user: this.currentUser, error: null };
    } catch (error) {
      console.error('Auth initialization error:', error);
      return { user: null, error: error.message };
    }
  }

  // Subscribe to auth state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of auth state changes
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Upload user avatar
  async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { url: null, error: error.message };
    }
  }

  // Upload restroom photo
  async uploadRestroomPhoto(restroomId, file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restroomId}-${userId}-${Date.now()}.${fileExt}`;
      const filePath = `restroom-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('restroom-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('restroom-photos')
        .getPublicUrl(filePath);

      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('Restroom photo upload error:', error);
      return { url: null, error: error.message };
    }
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;