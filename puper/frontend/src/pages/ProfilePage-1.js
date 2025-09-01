import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaTrophy, FaMapMarkerAlt } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const { id } = useParams();

  // Mock user data - replace with actual API call
  const user = {
    id: id || 1,
    username: 'toiletexplorer',
    displayName: 'Toilet Explorer',
    points: 1250,
    level: 12,
    reviewCount: 45,
    addedCount: 8,
    badges: [
      { name: 'First Review', icon: 'star', color: '#FFD700' },
      { name: 'Explorer', icon: 'compass', color: '#00CED1' },
      { name: 'Helper', icon: 'hands-helping', color: '#9B59B6' }
    ]
  };

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user.displayName.charAt(0)}</span>
          </div>
          <div className="profile-info">
            <h1>{user.displayName}</h1>
            <p>@{user.username}</p>
            <div className="profile-stats">
              <div className="stat">
                <FaTrophy />
                <span>Level {user.level}</span>
              </div>
              <div className="stat">
                <FaStar />
                <span>{user.points} Points</span>
              </div>
              <div className="stat">
                <FaMapMarkerAlt />
                <span>{user.addedCount} Added</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="badges-section">
            <h2>Badges</h2>
            <div className="badges-grid">
              {user.badges.map((badge, index) => (
                <div key={index} className="badge-card">
                  <div className="badge-icon" style={{ color: badge.color }}>
                    🏆
                  </div>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <span>Reviewed "Central Park Restroom"</span>
                <span className="activity-time">2 hours ago</span>
              </div>
              <div className="activity-item">
                <span>Added "Times Square Public Facility"</span>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
