import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroVideo from '../assets/images/hero-video.mp4';
import './Homepage.css';

const GlobeButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to="/map" className="globe-link">
      <motion.div
        className="interactive-globe-container"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="globe-sphere">
          <div className="globe-surface">
            <div className="continent continent-1"></div>
            <div className="continent continent-2"></div>
            <div className="continent continent-3"></div>
            <div className="continent continent-4"></div>
            <div className="continent continent-5"></div>
          </div>
          <div className="globe-atmosphere"></div>
        </div>
        <motion.div
          className="globe-label"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0.7, y: isHovered ? 0 : 10 }}
        >
          <span className="globe-text">EXPLORE MAP</span>
          <span className="globe-icon">🌍</span>
        </motion.div>
      </motion.div>
    </Link>
  );
};

const HomePage = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  return (
    <div className="home-page">
      {/* Hero Section with Video Background */}
      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        
        {/* Video overlay for better contrast */}
        <div className="video-overlay" />
        
        {/* Interactive Globe - Top left corner */}
        <motion.div
          className="hero-globe-container"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: videoLoaded ? 1 : 0, x: videoLoaded ? 0 : -50 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <GlobeButton />
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Why Choose Püper?
          </motion.h2>
          
          <div className="features-grid">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="feature-icon">🗺️</div>
              <h3>Real-time Map</h3>
              <p>Find restrooms near you with our interactive map powered by community data.</p>
            </motion.div>
            
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="feature-icon">⭐</div>
              <h3>Community Reviews</h3>
              <p>Read honest reviews about cleanliness, accessibility, and amenities.</p>
            </motion.div>
            
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="feature-icon">♿</div>
              <h3>Accessibility Info</h3>
              <p>Filter by wheelchair access, baby changing stations, and gender-neutral options.</p>
            </motion.div>
            
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="feature-icon">🏆</div>
              <h3>Earn Rewards</h3>
              <p>Contribute to the community and climb the leaderboard with points and badges.</p>
            </motion.div>
            
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="feature-icon">📱</div>
              <h3>Mobile First</h3>
              <p>Designed specifically for iPhone users with smooth, native-like performance.</p>
            </motion.div>
            
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <div className="feature-icon">🔒</div>
              <h3>Privacy Focused</h3>
              <p>Your data is secure and we never share your location without permission.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Join the Community</h2>
          <p>Help others find relief by adding and reviewing restrooms in your area.</p>
          <div className="cta-buttons">
            <Link to="/signup">
              <motion.button 
                className="cta-button primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </Link>
            <Link to="/leaderboard">
              <motion.button 
                className="cta-button secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Leaderboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;