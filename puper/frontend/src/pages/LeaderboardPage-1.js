import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const [period, setPeriod] = useState('all');

  // Mock leaderboard data - replace with actual API call
  const leaderboard = [
    { id: 1, username: 'toiletmaster', displayName: 'Toilet Master', points: 2500, level: 25, reviewCount: 120 },
    { id: 2, username: 'restroomranger', displayName: 'Restroom Ranger', points: 2200, level: 22, reviewCount: 98 },
    { id: 3, username: 'pottypatrol', displayName: 'Potty Patrol', points: 1950, level: 19, reviewCount: 87 },
    { id: 4, username: 'loolocator', displayName: 'Loo Locator', points: 1800, level: 18, reviewCount: 76 },
    { id: 5, username: 'bathroombuddy', displayName: 'Bathroom Buddy', points: 1650, level: 16, reviewCount: 65 }
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <motion.div 
      className="leaderboard-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="container">
        <div className="leaderboard-header">
          <h1><FaTrophy /> Community Leaderboard</h1>
          <p>Top contributors making restrooms accessible for everyone</p>
          
          <div className="period-selector">
            <button 
              className={period === 'all' ? 'active' : ''}
              onClick={() => setPeriod('all')}
            >
              All Time
            </button>
            <button 
              className={period === 'month' ? 'active' : ''}
              onClick={() => setPeriod('month')}
            >
              This Month
            </button>
            <button 
              className={period === 'week' ? 'active' : ''}
              onClick={() => setPeriod('week')}
            >
              This Week
            </button>
          </div>
        </div>

        <div className="leaderboard-list">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.id}
              className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="rank">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="user-avatar">
                <span>{user.displayName.charAt(0)}</span>
              </div>
              
              <div className="user-info">
                <h3>{user.displayName}</h3>
                <p>@{user.username}</p>
              </div>
              
              <div className="user-stats">
                <div className="stat">
                  <FaStar />
                  <span>{user.points} pts</span>
                </div>
                <div className="stat">
                  <FaTrophy />
                  <span>Level {user.level}</span>
                </div>
                <div className="stat">
                  <FaMapMarkerAlt />
                  <span>{user.reviewCount} reviews</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardPage;
