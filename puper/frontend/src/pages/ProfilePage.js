import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaStar, FaTrophy, FaMapMarkerAlt, FaEdit, FaCog, FaHeart, 
  FaClock, FaToilet, FaPlus, FaUser, FaMedal, FaCrown
} from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data - replace with actual API call
  const [user, setUser] = useState({
    id: id || 1,
    username: 'toiletexplorer',
    displayName: 'Toilet Explorer',
    email: 'toiletexplorer@example.com',
    bio: 'Helping people find the best restrooms around the world! 🚽',
    joinDate: '2024-01-15',
    points: 1250,
    level: 12,
    reviewCount: 45,
    addedCount: 8,
    favoriteCount: 23,
    badges: [
      { name: 'First Review', icon: 'star', color: '#FFD700', earned: '2024-01-16' },
      { name: 'Explorer', icon: 'compass', color: '#00CED1', earned: '2024-02-01' },
      { name: 'Helper', icon: 'hands-helping', color: '#9B59B6', earned: '2024-02-15' },
      { name: 'Top Contributor', icon: 'crown', color: '#FF6B6B', earned: '2024-03-01' }
    ],
    recentActivity: [
      { type: 'review', restroom: 'Central Park Public Restroom', rating: 4.5, time: '2 hours ago' },
      { type: 'add', restroom: 'Times Square Public Facility', time: '1 day ago' },
      { type: 'favorite', restroom: 'Brooklyn Bridge Park Restroom', time: '3 days ago' },
      { type: 'review', restroom: 'High Line Park Facility', rating: 3.8, time: '1 week ago' }
    ],
    stats: {
      totalReviews: 45,
      averageRating: 4.2,
      totalPoints: 1250,
      level: 12,
      nextLevelPoints: 1500,
      progress: 83
    }
  });

  const [editForm, setEditForm] = useState({
    displayName: user.displayName,
    bio: user.bio
  });

  useEffect(() => {
    // TODO: Fetch user data from API based on id
    console.log('Loading profile for user:', id);
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      displayName: user.displayName,
      bio: user.bio
    });
  };

  const handleSave = () => {
    setUser(prev => ({
      ...prev,
      displayName: editForm.displayName,
      bio: editForm.bio
    }));
    setIsEditing(false);
    // TODO: Save to backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      displayName: user.displayName,
      bio: user.bio
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'review': return <FaStar />;
      case 'add': return <FaPlus />;
      case 'favorite': return <FaHeart />;
      default: return <FaToilet />;
    }
  };

  const getBadgeIcon = (name) => {
    switch (name) {
      case 'First Review': return <FaStar />;
      case 'Explorer': return <FaMapMarkerAlt />;
      case 'Helper': return <FaUser />;
      case 'Top Contributor': return <FaCrown />;
      default: return <FaMedal />;
    }
  };

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="container">
        {/* Header */}
        <div className="profile-header">
          <div className="header-top">
            <button onClick={() => navigate(-1)} className="back-button">
              ←
            </button>
            <div className="header-actions">
              <button onClick={() => navigate('/settings')} className="settings-button">
                <FaCog />
              </button>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-avatar">
              <span>{user.displayName.charAt(0)}</span>
            </div>
            <div className="profile-info">
              {isEditing ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="edit-input"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="edit-textarea"
                    rows="2"
                  />
                  <div className="edit-actions">
                    <button onClick={handleSave} className="save-btn">Save</button>
                    <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1>{user.displayName}</h1>
                  <p>@{user.username}</p>
                  <p className="bio">{user.bio}</p>
                  <button onClick={handleEdit} className="edit-button">
                    <FaEdit /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-card">
              <FaTrophy className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">Level {user.level}</span>
                <span className="stat-label">Current Level</span>
              </div>
            </div>
            <div className="stat-card">
              <FaStar className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">{user.points}</span>
                <span className="stat-label">Points</span>
              </div>
            </div>
            <div className="stat-card">
              <FaToilet className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">{user.reviewCount}</span>
                <span className="stat-label">Reviews</span>
              </div>
            </div>
            <div className="stat-card">
              <FaMapMarkerAlt className="stat-icon" />
              <div className="stat-content">
                <span className="stat-number">{user.addedCount}</span>
                <span className="stat-label">Added</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="level-progress">
            <div className="progress-info">
              <span>Level {user.level}</span>
              <span>{user.points}/{user.nextLevelPoints} points</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${user.stats.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button 
            className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            Badges
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-item">
                  <FaStar />
                  <div>
                    <span className="stat-value">{user.stats.totalReviews}</span>
                    <span className="stat-label">Total Reviews</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FaTrophy />
                  <div>
                    <span className="stat-value">{user.stats.averageRating.toFixed(1)}</span>
                    <span className="stat-label">Avg Rating</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FaHeart />
                  <div>
                    <span className="stat-value">{user.favoriteCount}</span>
                    <span className="stat-label">Favorites</span>
                  </div>
                </div>
                <div className="stat-item">
                  <FaClock />
                  <div>
                    <span className="stat-value">Member since</span>
                    <span className="stat-label">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-section">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {user.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <span className="activity-text">
                        {activity.type === 'review' && `Reviewed "${activity.restroom}"`}
                        {activity.type === 'add' && `Added "${activity.restroom}"`}
                        {activity.type === 'favorite' && `Favorited "${activity.restroom}"`}
                        {activity.rating && ` (${activity.rating} ⭐)`}
                      </span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="badges-section">
              <h3>Achievements</h3>
              <div className="badges-grid">
                {user.badges.map((badge, index) => (
                  <div key={index} className="badge-card">
                    <div className="badge-icon" style={{ color: badge.color }}>
                      {getBadgeIcon(badge.name)}
                    </div>
                    <div className="badge-info">
                      <span className="badge-name">{badge.name}</span>
                      <span className="badge-date">Earned {new Date(badge.earned).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
