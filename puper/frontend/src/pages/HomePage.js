import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRoute, FaPlus } from 'react-icons/fa';
import Button from '../Common/Button';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section gif-hero">
      {/* GIF Background Layer */}
      <div className="hero-gif-background"></div>
      
      {/* Overlay for better text visibility */}
      <div className="hero-overlay"></div>
      
      {/* Psychedelic Animation Layer */}
      <div className="hero-psychedelic-layer"></div>
      
      {/* Main Content */}
      <div className="container">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Logo */}
          <motion.div
            className="hero-logo"
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img 
              src="/puper-logo.png" 
              alt="Püper Logo" 
              className="hero-logo-image" 
            />
          </motion.div>
          
          {/* Main Title */}
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            PÜPER
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            Your Guide to Relief, Wherever You Go
          </motion.p>

          {/* Tagline */}
          <motion.p
            className="hero-tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Find the best public restrooms with our community-driven platform
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Link to="/map" className="hero-link">
              <Button size="large" className="hero-cta-button primary-cta">
                <FaRoute className="button-icon" /> 
                <span>Find Restrooms</span>
              </Button>
            </Link>
            
            <Link to="/map?add=true" className="hero-link">
              <Button variant="secondary" size="large" className="hero-cta-button secondary-cta">
                <FaPlus className="button-icon" /> 
                <span>Add a Restroom</span>
              </Button>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Restrooms</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">25K+</span>
              <span className="stat-label">Reviews</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Users</span>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="scroll-text">Scroll to explore</span>
              <div className="scroll-arrow">↓</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;