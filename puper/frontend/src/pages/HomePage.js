import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaToilet, FaMapMarkerAlt, FaStar, FaUsers, FaWheelchair, FaShieldAlt, FaGlobe } from 'react-icons/fa';
import marbleBg from '../assets/images/marble-hero-bg.png';
import paperBg from '../assets/images/wood.png';
import heroVideo from '../assets/images/hero-video.mp4';
import './Homepage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const [activeFeature, setActiveFeature] = useState(0);

  // Features data
  const features = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Find Nearby",
      description: "Locate clean restrooms near your current location with real-time availability",
      color: "#4a0162ff"
    },
    {
      icon: <FaWheelchair />,
      title: "Accessibility",
      description: "Filter for wheelchair accessible facilities and family-friendly options",
      color: "#4a0162ff"
    },
    {
      icon: <FaStar />,
      title: "Reviews & Ratings",
      description: "Read honest reviews and ratings from our community of users",
      color: "#4a0162ff"
    },
    {
      icon: <FaShieldAlt />,
      title: "Verified Locations",
      description: "All locations are verified by our community for accuracy and cleanliness",
      color: "#4a0162ff"
    },
  ];

  // Stats data
  const stats = [
    { icon: <FaToilet />, number: "10,000+", label: "Restrooms Listed" },
    { icon: <FaUsers />, number: "50,000+", label: "Happy Users" },
    { icon: <FaStar />, number: "4.8/5", label: "Average Rating" },
    { icon: <FaGlobe />, number: "100+", label: "Cities Covered" }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <motion.div 
      className="homepage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
     >
      
      {/* Hero Section */}
      <section className="hero-section">
        {/* Video Background */}
        <div className="hero-video-wrapper">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>

        {/* Hero Content - Only Buttons */}
        <div className="hero-content-minimal">

          <motion.div
            className="hero-globe-container"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
          >
            <motion.div
              className="interactive-globe"
              onClick={() => navigate('/map')}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                rotate: [0, 360],
                boxShadow: [
                  '0 0 20px rgba(0, 255, 255, 0.5)',
                  '0 0 40px rgba(255, 0, 255, 0.5)',
                  '0 0 20px rgba(0, 255, 255, 0.5)'
                ]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <FaGlobe />
              <div className="globe-pulse"></div>
            </motion.div>
            <motion.p
              className="globe-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Click to explore restrooms worldwide
            </motion.p>
          </motion.div>
        </div>


      </section>

      {/* Features Section - New Style */}
      <section className="features-section" style={{ background: `url(${paperBg})`, backgroundSize: 'cover' }}>
        <>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Why Choose Püper?
          </motion.h2>
          <div className="features-carousel">
            <AnimatePresence mode="wait">
              {features.map((feature, index) => (
                index === activeFeature && (
                  <motion.div
                    key={index}
                    className="feature-showcase"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                      border: `3px solid ${feature.color}`,
                      borderRadius: '20px',
                      padding: '3rem',
                      textAlign: 'center',
                      boxShadow: `0 10px 40px ${feature.color}40`
                    }}
                  >
                    <div className="feature-icon-large" style={{ color: feature.color, fontSize: '4rem', marginBottom: '1.5rem' }}>
                      {feature.icon}
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ffeee7ff' }}>{feature.title}</h3>
                    <p style={{ fontSize: '1.2rem', color: '#ffffffff', lineHeight: '1.6' }}>{feature.description}</p>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
          <div className="feature-dots">
            {features.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === activeFeature ? 'active' : ''}`}
                onClick={() => setActiveFeature(index)}
                style={{
                  width: index === activeFeature ? '30px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: index === activeFeature ? features[index].color : '#ccc',
                  border: 'none',
                  margin: '0 5px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }} />
            ))}
          </div><div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-mini"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                  border: `2px solid ${feature.color}`,
                  cursor: 'pointer'
                }}
                onClick={() => setActiveFeature(index)}
              >
                <div style={{ color: feature.color, fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {feature.icon}
                </div>
                <h4 style={{ color: '#2c1810', marginBottom: '0.5rem' }}>{feature.title}</h4>
              </motion.div>
            ))}
          </div></>
      </section>

      {/* Stats Section */}
      <section className="stats-section" style={{ background: `url(${marbleBg})`, backgroundSize: 'cover' }}>
        <div className="stats-container">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ y: -10 }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Impact Section */}
      <section className="community-section">
        <div className="community-container">
          <motion.div
            className="community-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="community-title">Join Our Growing Community</h2>
            <p className="community-subtitle">Making restroom access easier for everyone, everywhere</p>

            <div className="impact-grid">
              <motion.div
                className="impact-card"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div className="impact-icon">🌍</div>
                <h3>Global Reach</h3>
                <p>Connecting restroom seekers across continents</p>
              </motion.div>

              <motion.div
                className="impact-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
              >
                <div className="impact-icon">🤝</div>
                <h3>Community Driven</h3>
                <p>Built by users, for users, with love</p>
              </motion.div>

              <motion.div
                className="impact-card"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div className="impact-icon">✨</div>
                <h3>Always Improving</h3>
                <p>Constantly evolving with new features</p>
              </motion.div>
            </div>

            <motion.button
              className="community-cta"
              onClick={() => navigate('/map')}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, type: "spring" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGlobe /> Start Your Journey
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
          </div>
          <div className="footer-links">
            <a href="/about">About</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="footer-social">
            <p>© 2024 Püper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default HomePage;