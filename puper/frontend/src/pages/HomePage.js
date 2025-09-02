import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaWheelchair, FaShieldAlt, FaStar, FaRoad, FaGasPump, FaCar } from 'react-icons/fa';
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
      
      {/* Hero Section - Simplified for iPhone */}
      <section className="hero-section">
        {/* Video Background */}
        <div className="hero-video-wrapper">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>

        {/* Hero Content - Simplified, No Globe */}
        <div className="hero-content-minimal">
          <motion.div
            className="hero-cta-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="hero-title">PÜPER</h1>
            <p className="hero-subtitle">Find Clean Restrooms Anywhere</p>
            
            <motion.button
              className="cta-button"
              onClick={() => navigate('/map')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Open Map
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={{ background: `url(${paperBg})`, backgroundSize: 'cover' }}>
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
                    padding: '2rem',
                    textAlign: 'center',
                    boxShadow: `0 10px 40px ${feature.color}40`
                  }}
                >
                  <div className="feature-icon-large" style={{ color: feature.color, fontSize: '3rem', marginBottom: '1rem' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#ffeee7ff' }}>{feature.title}</h3>
                  <p style={{ fontSize: '1rem', color: '#ffffffff', lineHeight: '1.5' }}>{feature.description}</p>
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
              }}
            />
          ))}
        </div>
        
        <div className="features-grid">
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
                padding: '1rem',
                borderRadius: '15px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                border: `2px solid ${feature.color}`,
                cursor: 'pointer'
              }}
              onClick={() => setActiveFeature(index)}
            >
              <div style={{ color: feature.color, fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                {feature.icon}
              </div>
              <h4 style={{ color: '#2c1810', marginBottom: '0.25rem', fontSize: '0.85rem' }}>{feature.title}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Highway Rest Stops Section */}
      <section className="highway-section">
        <div className="highway-container">
          <motion.div
            className="highway-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="highway-title">Highway Rest Stops</h2>
            <p className="highway-subtitle">Find clean facilities at major highway rest areas and travel centers</p>

            <div className="highway-grid">
              <motion.div
                className="highway-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="highway-icon"><FaRoad /></div>
                <h3>Interstate Rest Areas</h3>
                <p>Official state-maintained rest stops with clean facilities</p>
              </motion.div>

              <motion.div
                className="highway-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="highway-icon"><FaGasPump /></div>
                <h3>Travel Centers</h3>
                <p>Major truck stops and travel plazas with 24/7 access</p>
              </motion.div>

              <motion.div
                className="highway-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="highway-icon"><FaCar /></div>
                <h3>Exit Services</h3>
                <p>Quick access to restrooms at highway exits</p>
              </motion.div>
            </div>

            <motion.button
              className="highway-cta"
              onClick={() => navigate('/map')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaRoad /> Find Highway Stops
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
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