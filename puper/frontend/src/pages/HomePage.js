import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaToilet, FaMapMarkerAlt, FaStar, FaUsers, FaPlus, FaWheelchair, FaShieldAlt, FaMobile, FaGlobe } from 'react-icons/fa';
import woodBg from '../assets/images/wood5.png';
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
      color: "#ffffffff"
    },
    {
      icon: <FaWheelchair />,
      title: "Accessibility",
      description: "Filter for wheelchair accessible facilities and family-friendly options",
      color: "#ffffffff"
    },
    {
      icon: <FaStar />,
      title: "Reviews & Ratings",
      description: "Read honest reviews and ratings from our community of users",
      color: "#ffffffff"
    },
    {
      icon: <FaShieldAlt />,
      title: "Verified Locations",
      description: "All locations are verified by our community for accuracy and cleanliness",
      color: "#ffffffff"
    }
  ];

  // Stats data
  const stats = [
    
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
            className="hero-buttons"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button
              className="hero-cta-button primary-cta"
              onClick={() => navigate('/map')}
              style={{
                background: '#4B0082',
                border: '2px solid #8A2BE2',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: '50px',
                boxShadow: '0 4px 15px rgba(75, 0, 130, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease'
              }}
            >
              <FaMapMarkerAlt /> Find Restrooms Near Me
            </button>
            <button
              className="hero-cta-button secondary-cta"
              onClick={() => navigate('/map?add=true')}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid #4B0082',
                color: '#4B0082',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: '50px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease'
              }}
            >
              <FaPlus /> Add a Restroom
            </button>
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
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#2c1810' }}>{feature.title}</h3>
                    <p style={{ fontSize: '1.2rem', color: '#4a3426', lineHeight: '1.6' }}>{feature.description}</p>
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

      {/* Call to Action */}
      <section className="cta-section" style={{ background: `url(${woodBg})`, backgroundSize: 'cover' }}>
        <motion.div
          className="cta-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Find Your Next Stop?</h2>
          <p>Join thousands of users who never worry about finding a clean restroom again</p>
          <div className="cta-buttons">
            <button 
              className="btn-cta-primary"
              onClick={() => navigate('/map')}
              style={{
                background: '#4B0082',
                color: 'white',
                padding: '1.2rem 2.5rem',
                fontSize: '1.2rem',
                border: '2px solid #8A2BE2',
                borderRadius: '10px',
                fontWeight: 'bold',
                boxShadow: '0 6px 20px rgba(75, 0, 130, 0.4)'
              }}
            >
              <FaGlobe /> Explore Map
            </button>
            <button 
              className="btn-cta-secondary"
              onClick={() => navigate('/login')}
              style={{
                background: 'white',
                color: '#4B0082',
                padding: '1.2rem 2.5rem',
                fontSize: '1.2rem',
                border: '2px solid #4B0082',
                borderRadius: '10px',
                fontWeight: 'bold',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              <FaMobile /> Get Started Free
            </button>
          </div>
        </motion.div>
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