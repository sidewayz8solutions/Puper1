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
    <div className="hero-container">
      {/* Video Background */}
      <video
        className="hero-background"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/hero-movie.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="hero-overlay">
        <h1 className="hero-title">PÜPER</h1>
        <p className="hero-subtitle">Find the best public restrooms, wherever you go.</p>
        <Link to="/map">
          <button className="hero-button">
            Find Restrooms Near Me
          </button>
        </Link>
      </div>
    </div>
  );
}


function HomePage() {
  return (
    <div className="home-page">
      <Hero />

      {/* Features Section */}
      <section className="features-section marble-background">
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
      <section className="cta-section marble-background">
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

export default HomePage;