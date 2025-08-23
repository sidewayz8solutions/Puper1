import { supabase } from './supabase';

/**
 * State-of-the-art gamification system for Puper
 * Features: Points, badges, achievements, leaderboards
 */

// Point values for different actions
export const POINT_VALUES = {
  ADD_RESTROOM: 10,
  ADD_REVIEW: 5,
  UPLOAD_PHOTO: 3,
  HELPFUL_REVIEW: 2,
  FIRST_REVIEW: 5,
  VERIFIED_LOCATION: 15
};

// Badge definitions
export const BADGES = {
  FIRST_FIND: {
    id: 'first_find',
    name: 'First Find',
    description: 'Added your first restroom location',
    icon: '🎯',
    points: 10,
    condition: (stats) => stats.restrooms_added >= 1
  },
  REVIEWER: {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Left your first review',
    icon: '⭐',
    points: 5,
    condition: (stats) => stats.reviews_added >= 1
  },
  EXPLORER: {
    id: 'explorer',
    name: 'Explorer',
    description: 'Found 5 restroom locations',
    icon: '🗺️',
    points: 25,
    condition: (stats) => stats.restrooms_added >= 5
  },
  CRITIC: {
    id: 'critic',
    name: 'Critic',
    description: 'Left 10 helpful reviews',
    icon: '📝',
    points: 50,
    condition: (stats) => stats.reviews_added >= 10
  },
  PIONEER: {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'Found 25 restroom locations',
    icon: '🏆',
    points: 100,
    condition: (stats) => stats.restrooms_added >= 25
  },
  CLEANLINESS_CHAMPION: {
    id: 'cleanliness_champion',
    name: 'Cleanliness Champion',
    description: 'Consistently rates cleanliness accurately',
    icon: '✨',
    points: 75,
    condition: (stats) => stats.helpful_reviews >= 20
  },
  ACCESSIBILITY_ADVOCATE: {
    id: 'accessibility_advocate',
    name: 'Accessibility Advocate',
    description: 'Added 10 accessibility-focused reviews',
    icon: '♿',
    points: 60,
    condition: (stats) => stats.accessibility_reviews >= 10
  },
  PHOTO_CONTRIBUTOR: {
    id: 'photo_contributor',
    name: 'Photo Contributor',
    description: 'Uploaded 15 helpful photos',
    icon: '📸',
    points: 45,
    condition: (stats) => stats.photos_uploaded >= 15
  },
  COMMUNITY_LEADER: {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Reached 500 total points',
    icon: '👑',
    points: 0,
    condition: (stats) => stats.total_points >= 500
  },
  LEGEND: {
    id: 'legend',
    name: 'Püper Legend',
    description: 'Reached 1000 total points',
    icon: '🌟',
    points: 0,
    condition: (stats) => stats.total_points >= 1000
  }
};

// Rank system based on points
export const RANKS = [
  { name: 'Newcomer', minPoints: 0, icon: '🆕', color: '#94A3B8' },
  { name: 'Explorer', minPoints: 50, icon: '🔍', color: '#3B82F6' },
  { name: 'Contributor', minPoints: 150, icon: '📍', color: '#10B981' },
  { name: 'Expert', minPoints: 300, icon: '⭐', color: '#F59E0B' },
  { name: 'Champion', minPoints: 600, icon: '🏆', color: '#EF4444' },
  { name: 'Legend', minPoints: 1000, icon: '👑', color: '#8B5CF6' }
];

export class GamificationService {
  // Award points for an action
  static async awardPoints(userId, action, metadata = {}) {
    try {
      const points = POINT_VALUES[action];
      if (!points) {
        console.warn(`Unknown action: ${action}`);
        return null;
      }

      // Record the point transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('point_transactions')
        .insert([{
          user_id: userId,
          action,
          points,
          metadata,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update user's total points
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('total_points, badges')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const newTotalPoints = (profile.total_points || 0) + points;

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          total_points: newTotalPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Check for new badges
      const newBadges = await this.checkForNewBadges(userId);

      return {
        pointsAwarded: points,
        totalPoints: newTotalPoints,
        newBadges,
        transaction
      };

    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  // Check if user has earned new badges
  static async checkForNewBadges(userId) {
    try {
      // Get user stats
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get additional stats
      const stats = await this.getUserStats(userId);
      const currentBadges = profile.badges || [];
      const newBadges = [];

      // Check each badge condition
      Object.values(BADGES).forEach(badge => {
        const hasBadge = currentBadges.some(b => b.id === badge.id);
        
        if (!hasBadge && badge.condition(stats)) {
          newBadges.push({
            ...badge,
            earnedAt: new Date().toISOString()
          });
        }
      });

      // Award new badges
      if (newBadges.length > 0) {
        const updatedBadges = [...currentBadges, ...newBadges];
        const badgePoints = newBadges.reduce((sum, badge) => sum + badge.points, 0);

        await supabase
          .from('user_profiles')
          .update({ 
            badges: updatedBadges,
            total_points: profile.total_points + badgePoints,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        console.log(`🏆 User ${userId} earned ${newBadges.length} new badges!`);
      }

      return newBadges;

    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  // Get comprehensive user stats
  static async getUserStats(userId) {
    try {
      const [profile, restroomStats, reviewStats, photoStats] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', userId).single(),
        supabase.from('restrooms').select('id').eq('user_id', userId),
        supabase.from('reviews').select('id, rating').eq('user_id', userId),
        supabase.from('restroom_photos').select('id').eq('user_id', userId)
      ]);

      const stats = {
        ...profile.data,
        restrooms_added: restroomStats.data?.length || 0,
        reviews_added: reviewStats.data?.length || 0,
        photos_uploaded: photoStats.data?.length || 0,
        helpful_reviews: reviewStats.data?.filter(r => r.rating >= 4).length || 0,
        accessibility_reviews: 0 // Would need to check review content
      };

      return stats;

    } catch (error) {
      console.error('Error getting user stats:', error);
      return {};
    }
  }

  // Get user's current rank
  static getUserRank(totalPoints) {
    const rank = RANKS
      .slice()
      .reverse()
      .find(rank => totalPoints >= rank.minPoints);
    
    return rank || RANKS[0];
  }

  // Get next rank and progress
  static getRankProgress(totalPoints) {
    const currentRank = this.getUserRank(totalPoints);
    const currentIndex = RANKS.findIndex(r => r.name === currentRank.name);
    const nextRank = RANKS[currentIndex + 1];

    if (!nextRank) {
      return {
        currentRank,
        nextRank: null,
        progress: 100,
        pointsToNext: 0
      };
    }

    const pointsToNext = nextRank.minPoints - totalPoints;
    const progress = ((totalPoints - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100;

    return {
      currentRank,
      nextRank,
      progress: Math.max(0, Math.min(100, progress)),
      pointsToNext: Math.max(0, pointsToNext)
    };
  }

  // Get leaderboard
  static async getLeaderboard(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, display_name, total_points, badges, restrooms_added, reviews_added')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((user, index) => ({
        ...user,
        rank: index + 1,
        userRank: this.getUserRank(user.total_points)
      }));

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Get user's leaderboard position
  static async getUserLeaderboardPosition(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_rank', { user_id: userId });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }
}

export default GamificationService;
