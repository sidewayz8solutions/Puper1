import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRoute, FaPlus, FaTrophy } from 'react-icons/fa';
import Button from '../components/Common/Button';
import woodBg from '../assets/images/wood.png';
import ctaBg from '../assets/images/1.png';
import './HomePage.css';

const HomePage = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Force video to play
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video is playing');
          })
          .catch(error => {
            console.log('Video autoplay failed:', error);
            // Try to play on user interaction
            document.addEventListener('click', () => {
              video.play().catch(e => console.log('Manual play failed:', e));
            }, { once: true });
          });
      }
    }
  }, []);
  return (
    <div className="home-page">
      <div className="psychedelic-bg" />
      
      <section className="hero-section video-hero">
        <div className="video-background">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="hero-video"
            poster="/puper-logo.png"
            onLoadStart={() => console.log('Video loading started')}
            onCanPlay={() => console.log('Video can play')}
            onError={(e) => {
              console.error('Video error:', e);
              // Hide video and show fallback
              e.target.style.display = 'none';
            }}
            onLoadedData={() => console.log('Video loaded')}
          >
            <source src={`${process.env.PUBLIC_URL}/hero-video.mp4`} type="video/mp4" />
            <source src="/hero-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
          <div className="video-fallback"></div>
        </div>

        <div className="container">
          <motion.div
            className="hero-content video-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="hero-logo">
              <img src="/puper-logo.png" alt="Püper Logo" className="hero-logo-image" />
            </div>
            <h1 className="hero-title">Roll With Confidence</h1>
            <p className="hero-description">
              Clean, accessible toilets right at your fingertips.
              Rate, review, and help others in their time of need.
              Roll On!
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
};

export default HomePage;
