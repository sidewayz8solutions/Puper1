import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRoute, FaPlus, FaTrophy, FaToiletPaper } from 'react-icons/fa';
import Button from '../components/Common/Button';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="psychedelic-bg" />
      
      <section className="hero-section">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-logo">
              <img src="/puper-logo.png" alt="Püper Logo" className="hero-logo-image" />
            </div>
            <h1 className="hero-title">PÜPER</h1>
            <p className="hero-description">
              Find clean, accessible restrooms along your route. 
              Rate, review, and help others in their time of need.
            </p>
            
            <div className="hero-actions">
              <Link to="/map">
                <Button size="large" className="cta-button">
                  <FaRoute /> Find Restrooms
                </Button>
              </Link>
              <Link to="/map?add=true">
                <Button variant="secondary" size="large">
                  <FaPlus /> Add a Restroom
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Join the Community</h2>
            <p>Help others find relief by adding and reviewing restrooms in your area.</p>
            <Link to="/leaderboard">
              <Button size="large">
                <FaTrophy /> View Leaderboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
