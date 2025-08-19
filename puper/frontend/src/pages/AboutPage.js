import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaUsers, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <motion.div 
      className="about-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="container">
        <div className="about-header">
          <h1>About Püper</h1>
          <p className="about-subtitle">Your Guide to Relief</p>
        </div>

        <div className="about-content">
          <section className="mission-section">
            <h2>Our Mission</h2>
            <p>
              Püper was created to solve a universal problem: finding clean, accessible public restrooms 
              when you need them most. We believe that access to clean facilities is a basic human need, 
              and our community-driven platform helps make this a reality for everyone.
            </p>
          </section>

          <section className="features-section">
            <h2>How It Works</h2>
            <div className="features-grid">
              <div className="feature-item">
                <FaMapMarkerAlt className="feature-icon" />
                <h3>Discover</h3>
                <p>Find restrooms near you with real-time location data and community reviews.</p>
              </div>
              <div className="feature-item">
                <FaStar className="feature-icon" />
                <h3>Review</h3>
                <p>Rate restrooms on cleanliness, accessibility, and amenities to help others.</p>
              </div>
              <div className="feature-item">
                <FaUsers className="feature-icon" />
                <h3>Contribute</h3>
                <p>Add new restrooms to the map and earn points for helping the community.</p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <h2>Community Impact</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Restrooms Mapped</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">25,000+</div>
                <div className="stat-label">Reviews Written</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">5,000+</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
          </section>

          <section className="team-section">
            <h2>Built with <FaHeart className="heart" /></h2>
            <p>
              Püper is an open-source project built by developers who understand the importance 
              of accessible public facilities. We're committed to making this platform free and 
              available to everyone, everywhere.
            </p>
          </section>

          <section className="contact-section">
            <h2>Get Involved</h2>
            <p>
              Want to contribute to Püper? We welcome developers, designers, and community members 
              who want to help make public restrooms more accessible. Check out our GitHub repository 
              or reach out to our team.
            </p>
            <div className="contact-buttons">
              <a href="#" className="btn btn-primary">GitHub</a>
              <a href="#" className="btn btn-secondary">Contact Us</a>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default AboutPage;
