import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRoute, FaPlus, FaTrophy } from 'react-icons/fa';
import Button from '../components/Common/Button';
import woodBg from '../assets/images/wood.png';
import ctaBg from '../assets/images/1.png';
import './HomePage.css';
import '../components/Hero/Hero.css';

// Stats data could be fetched from an API or updated periodically for accuracy.
// For now, these are hardcoded demo values.
const stats = [
  { number: '10K+', label: 'Restrooms' },
  { number: '25K+', label: 'Reviews' },
  { number: '5K+', label: 'Users' }
];

const Hero = () => {
  return (
    <section className="hero-section">
      {/* YouTube Background Video */}
      <div className="hero-video-wrapper">
        <iframe
          className="hero-video"
          src="https://www.youtube.com/embed/ElA01pd6jrE?autoplay=1&mute=1&loop=1&playlist=ElA01pd6jrE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
          title="Hero Background Video"
          style={{ border: 'none' }}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        ></iframe>
      </div>
    
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

        {/* Stats Row */}
        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {stats.map((stat, idx) => (
            <React.Fragment key={stat.label}>
              <div className="stat-item">
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
              {idx < stats.length - 1 && <div className="stat-divider"></div>}
            </React.Fragment>
          ))}
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
    </section>
        );

function HomePage() {
  return (
    <div className="home-page">
      <Hero />

      {/* Features Section */}
      <section className="features-section" style={{ backgroundImage: `url(${woodBg})` }}>
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

      {/* CTA Section */}
      <section className="cta-section" style={{ backgroundImage: `url(${ctaBg})` }}>
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
              <Button size="large" className="leaderboard-button">
                <FaTrophy /> View Leaderboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
}
export default HomePage;

