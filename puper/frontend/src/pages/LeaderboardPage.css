import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaStar, FaMapMarkerAlt, FaFire, FaMedal, FaCrown, FaChartLine } from 'react-icons/fa';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const [period, setPeriod] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    totalUsers: 0,
    totalReviews: 0,
    totalPoints: 0
  });

  // Enhanced leaderboard data with more details
  const leaderboard = [
    { 
      id: 1, 
      username: 'toiletmaster', 
      displayName: 'Toilet Master', 
      points: 2500, 
      level: 25, 
      reviewCount: 120,
      streak: 45,
      badges: ['🏆', '🔥', '⭐', '💎'],
      topContributor: true,
      avatar: '🦸',
      joinDate: '2024-01-15',
      accuracy: 98
    },
    { 
      id: 2, 
      username: 'restroomranger', 
      displayName: 'Restroom Ranger', 
      points: 2200, 
      level: 22, 
      reviewCount: 98,
      streak: 30,
      badges: ['🥈', '🎯', '🌟'],
      avatar: '🤠',
      joinDate: '2024-02-20',
      accuracy: 95
    },
    { 
      id: 3, 
      username: 'pottypatrol', 
      displayName: 'Potty Patrol', 
      points: 1950, 
      level: 19, 
      reviewCount: 87,
      streak: 21,
      badges: ['🥉', '🚀', '💫'],
      avatar: '👮',
      joinDate: '2024-03-10',
      accuracy: 92
    },
    { 
      id: 4, 
      username: 'loolocator', 
      displayName: 'Loo Locator', 
      points: 1800, 
      level: 18, 
      reviewCount: 76,
      streak: 15,
      badges: ['🗺️', '🎖️'],
      avatar: '🕵️',
      joinDate: '2024-03-25',
      accuracy: 89
    },
    { 
      id: 5, 
      username: 'bathroombuddy', 
      displayName: 'Bathroom Buddy', 
      points: 1650, 
      level: 16, 
      reviewCount: 65,
      streak: 12,
      badges: ['🤝', '✨'],
      avatar: '🦾',
      joinDate: '2024-04-01',
      accuracy: 87
    },
    { 
      id: 6, 
      username: 'flushfinder', 
      displayName: 'Flush Finder', 
      points: 1500, 
      level: 15, 
      reviewCount: 58,
      streak: 10,
      badges: ['🔍', '💧'],
      avatar: '🔮',
      joinDate: '2024-04-15',
      accuracy: 85
    },
    { 
      id: 7, 
      username: 'stalled', 
      displayName: 'Stall Scout', 
      points: 1350, 
      level: 13, 
      reviewCount: 52,
      streak: 8,
      badges: ['🎯'],
      avatar: '🥷',
      joinDate: '2024-05-01',
      accuracy: 82
    }
  ];

  useEffect(() => {
    // Animate stats on mount
    const targetStats = {
      totalUsers: 5342,
      totalReviews: 25847,
      totalPoints: 892450
    };
    
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedStats({
        totalUsers: Math.floor(targetStats.totalUsers * progress),
        totalReviews: Math.floor(targetStats.totalReviews * progress),
        totalPoints: Math.floor(targetStats.totalPoints * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, increment);
    
    return () => clearInterval(timer);
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="rank-icon gold" />;
    if (rank === 2) return <FaMedal className="rank-icon silver" />;
    if (rank === 3) return <FaMedal className="rank-icon bronze" />;
    return <span className="rank-number">#{rank}</span>;
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return '#ff6b6b';
    if (streak >= 14) return '#ffd93d';
    return '#6bcf7f';
  };

  return (
    <motion.div 
      className="leaderboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>
      
      <div className="leaderboard-container">
        {/* Header with Stats */}
        <motion.div 
          className="leaderboard-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="leaderboard-title">
            <FaTrophy className="title-icon" />
            Community Champions
          </h1>
          <p className="leaderboard-subtitle">Top contributors making restrooms accessible for everyone</p>
          
          {/* Live Stats */}
          <div className="stats-row">
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <span className="stat-value">{animatedStats.totalUsers.toLocaleString()}</span>
              <span className="stat-label">Active Users</span>
            </motion.div>
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <span className="stat-value">{animatedStats.totalReviews.toLocaleString()}</span>
              <span className="stat-label">Total Reviews</span>
            </motion.div>
            <motion.div 
              className="stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <span className="stat-value">{animatedStats.totalPoints.toLocaleString()}</span>
              <span className="stat-label">Points Earned</span>
            </motion.div>
          </div>
          
          {/* Period Selector */}
          <div className="period-selector">
            {['all', 'month', 'week', 'today'].map((p) => (
              <motion.button
                key={p}
                className={`period-btn ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {p === 'all' ? 'All Time' : 
                 p === 'month' ? 'This Month' : 
                 p === 'week' ? 'This Week' : 'Today'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div 
          className="podium-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[2, 1, 3].map((position) => {
            const user = leaderboard[position - 1];
            return (
              <motion.div
                key={user.id}
                className={`podium-spot position-${position}`}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedUser(user)}
              >
                <div className="podium-avatar">
                  <span className="avatar-emoji">{user.avatar}</span>
                  {position === 1 && <FaCrown className="crown-icon" />}
                </div>
                <h3 className="podium-name">{user.displayName}</h3>
                <div className="podium-stats">
                  <span className="podium-points">{user.points.toLocaleString()} pts</span>
                  <span className="podium-level">Level {user.level}</span>
                </div>
                <div className="podium-badges">
                  {user.badges.slice(0, 3).map((badge, i) => (
                    <span key={i} className="badge-icon">{badge}</span>
                  ))}
                </div>
                <div className={`podium-base base-${position}`}>
                  {getRankIcon(position)}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Leaderboard List */}
        <motion.div 
          className="leaderboard-list"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {leaderboard.slice(3).map((user, index) => (
            <motion.div
              key={user.id}
              className="leaderboard-item"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ x: 10, scale: 1.02 }}
              onClick={() => setSelectedUser(user)}
            >
              <div className="rank-section">
                {getRankIcon(index + 4)}
              </div>
              
              <div className="user-section">
                <div className="user-avatar-small">
                  <span>{user.avatar}</span>
                </div>
                <div className="user-info">
                  <h4>{user.displayName}</h4>
                  <p>@{user.username}</p>
                </div>
              </div>
              
              <div className="stats-section">
                <div className="stat-item">
                  <FaStar className="stat-icon" />
                  <span>{user.points.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <FaFire className="stat-icon" style={{ color: getStreakColor(user.streak) }} />
                  <span>{user.streak}d</span>
                </div>
                <div className="stat-item">
                  <FaMapMarkerAlt className="stat-icon" />
                  <span>{user.reviewCount}</span>
                </div>
              </div>
              
              <div className="badges-section">
                {user.badges.map((badge, i) => (
                  <span key={i} className="mini-badge">{badge}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              className="user-modal"
              initial={{ scale: 0.8, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 100 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
              
              <div className="modal-header">
                <div className="modal-avatar">
                  <span>{selectedUser.avatar}</span>
                </div>
                <h2>{selectedUser.displayName}</h2>
                <p>@{selectedUser.username}</p>
              </div>
              
              <div className="modal-stats-grid">
                <div className="modal-stat">
                  <FaStar />
                  <span className="modal-stat-value">{selectedUser.points.toLocaleString()}</span>
                  <span className="modal-stat-label">Total Points</span>
                </div>
                <div className="modal-stat">
                  <FaFire style={{ color: getStreakColor(selectedUser.streak) }} />
                  <span className="modal-stat-value">{selectedUser.streak}</span>
                  <span className="modal-stat-label">Day Streak</span>
                </div>
                <div className="modal-stat">
                  <FaMapMarkerAlt />
                  <span className="modal-stat-value">{selectedUser.reviewCount}</span>
                  <span className="modal-stat-label">Reviews</span>
                </div>
                <div className="modal-stat">
                  <FaChartLine />
                  <span className="modal-stat-value">{selectedUser.accuracy}%</span>
                  <span className="modal-stat-label">Accuracy</span>
                </div>
              </div>
              
              <div className="modal-badges">
                <h3>Achievements</h3>
                <div className="badge-grid">
                  {selectedUser.badges.map((badge, i) => (
                    <div key={i} className="achievement-badge">
                      <span className="achievement-icon">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-footer">
                <p>Member since {new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                <p>Level {selectedUser.level} Contributor</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LeaderboardPage;