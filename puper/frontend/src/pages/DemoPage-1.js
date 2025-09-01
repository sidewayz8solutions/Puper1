import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaToilet, FaRoute, FaPlus } from 'react-icons/fa';
import Button from '../components/Common/Button';
import './DemoPage.css';

const DemoPage = () => {
  const [currentDemo, setCurrentDemo] = useState('hero');
  const [isLoading, setIsLoading] = useState(false);

  // Demo data
  const demoRestrooms = [
    {
      id: 1,
      name: 'Central Park Restroom',
      rating: 4.5,
      distance: '0.2 miles',
      amenities: ['wheelchair', 'baby_changing'],
      status: 'open'
    },
    {
      id: 2,
      name: 'Times Square Public Facility',
      rating: 3.8,
      distance: '0.5 miles',
      amenities: ['wheelchair'],
      status: 'open'
    },
    {
      id: 3,
      name: 'Bryant Park Restroom',
      rating: 4.2,
      distance: '0.7 miles',
      amenities: ['baby_changing', 'gender_neutral'],
      status: 'open'
    }
  ];

  const demoSections = [
    { id: 'hero', name: 'Hero Section', icon: '🎬' },
    { id: 'map', name: 'Interactive Map', icon: '🗺️' },
    { id: 'search', name: 'Search & Filters', icon: '🔍' },
    { id: 'reviews', name: 'Reviews System', icon: '🚽' },
    { id: 'gamification', name: 'Gamification', icon: '🏆' }
  ];

  const handleDemoChange = (demoId) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentDemo(demoId);
      setIsLoading(false);
    }, 500);
  };

  const renderDemoContent = () => {
    switch (currentDemo) {
      case 'hero':
        return (
          <div className="demo-hero">
            <motion.div
              className="demo-hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="demo-title">Welcome to Püper</h1>
              <p className="demo-subtitle">Your Guide to Relief</p>
              <div className="demo-buttons">
                <Button className="demo-btn primary">
                  <FaRoute /> Find Restrooms
                </Button>
                <Button className="demo-btn secondary">
                  <FaPlus /> Add Location
                </Button>
              </div>
            </motion.div>
          </div>
        );

      case 'map':
        return (
          <div className="demo-map">
            <div className="demo-map-container">
              <div className="demo-map-placeholder">
                <FaMapMarkerAlt className="map-icon" />
                <p>Interactive Map View</p>
                <div className="demo-markers">
                  {demoRestrooms.map((restroom, index) => (
                    <motion.div
                      key={restroom.id}
                      className="demo-marker"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      style={{
                        left: `${20 + index * 25}%`,
                        top: `${30 + index * 15}%`
                      }}
                    >
                      <FaMapMarkerAlt />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="demo-search">
            <div className="demo-search-bar">
              <input 
                type="text" 
                placeholder="Search for restrooms near you..."
                className="demo-input"
              />
              <Button className="search-btn">Search</Button>
            </div>
            <div className="demo-filters">
              <div className="filter-chip">♿ Wheelchair Accessible</div>
              <div className="filter-chip">👶 Baby Changing</div>
              <div className="filter-chip">🚻 Gender Neutral</div>
              <div className="filter-chip">💰 Free</div>
            </div>
            <div className="demo-results">
              {demoRestrooms.map((restroom) => (
                <motion.div
                  key={restroom.id}
                  className="demo-result-card"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3>{restroom.name}</h3>
                  <div className="result-rating">
                    <FaToilet className="star" />
                    <span>{restroom.rating}</span>
                  </div>
                  <p className="result-distance">{restroom.distance}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="demo-reviews">
            <h3>Community Reviews</h3>
            <div className="demo-review-cards">
              <motion.div className="review-card" whileHover={{ y: -5 }}>
                <div className="review-header">
                  <span className="reviewer">ToiletExplorer</span>
                  <div className="review-stars">
                    {[1,2,3,4,5].map(i => (
                      <FaToilet key={i} className="star filled" />
                    ))}
                  </div>
                </div>
                <p>"Very clean and well-maintained. Great location!"</p>
              </motion.div>
              <motion.div className="review-card" whileHover={{ y: -5 }}>
                <div className="review-header">
                  <span className="reviewer">RestroomRanger</span>
                  <div className="review-stars">
                    {[1,2,3,4].map(i => (
                      <FaToilet key={i} className="star filled" />
                    ))}
                    <FaToilet className="star" />
                  </div>
                </div>
                <p>"Good facilities, wheelchair accessible entrance."</p>
              </motion.div>
            </div>
          </div>
        );

      case 'gamification':
        return (
          <div className="demo-gamification">
            <div className="demo-profile">
              <div className="profile-avatar">🏆</div>
              <h3>ToiletMaster</h3>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">1,250</span>
                  <span className="stat-label">Points</span>
                </div>
                <div className="stat">
                  <span className="stat-number">Level 12</span>
                  <span className="stat-label">Explorer</span>
                </div>
                <div className="stat">
                  <span className="stat-number">45</span>
                  <span className="stat-label">Reviews</span>
                </div>
              </div>
              <div className="demo-badges">
                <div className="badge">🌟 First Review</div>
                <div className="badge">🗺️ Explorer</div>
                <div className="badge">🤝 Helper</div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a demo section</div>;
    }
  };

  return (
    <div className="demo-page">
      <div className="demo-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="demo-page-title"
        >
          Püper Demo
        </motion.h1>
        <p className="demo-page-subtitle">
          Explore the features of your restroom finding companion
        </p>
      </div>

      <div className="demo-navigation">
        {demoSections.map((section) => (
          <motion.button
            key={section.id}
            className={`demo-nav-btn ${currentDemo === section.id ? 'active' : ''}`}
            onClick={() => handleDemoChange(section.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="demo-nav-icon">{section.icon}</span>
            <span className="demo-nav-text">{section.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="demo-content">
        {isLoading ? (
          <div className="demo-loading">
            <div className="loading-spinner"></div>
            <p>Loading demo...</p>
          </div>
        ) : (
          <motion.div
            key={currentDemo}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderDemoContent()}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DemoPage;
