import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaWheelchair, FaShieldAlt, FaStar, FaRoad, FaGasPump, FaCar } from 'react-icons/fa';
import heroVideo from '../assets/images/hero-video.mp4';
import './Homepage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 200;
    const height = canvas.height = 200;
    
    let rotation = 0;
    const dots = [];
    const dotCount = 200;
    
    // Generate random points on sphere
    for (let i = 0; i < dotCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dots.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi)
      });
    }
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);
      
      // Sort dots by z-index for proper layering
      const projected = dots.map(dot => {
        const x = dot.x * Math.cos(rotation) - dot.z * Math.sin(rotation);
        const z = dot.x * Math.sin(rotation) + dot.z * Math.cos(rotation);
        
        const scale = 200 / (200 + z * 100);
        const x2d = x * scale * 60 + width / 2;
        const y2d = dot.y * scale * 60 + height / 2;
        const alpha = Math.max(0.1, (z + 1) / 2);
        
        return { x: x2d, y: y2d, scale, alpha, z };
      }).sort((a, b) => a.z - b.z);
      
      // Draw connections
      ctx.strokeStyle = isHovered ? 'rgba(13, 255, 231, 0.3)' : 'rgba(147, 51, 234, 0.2)';
      ctx.lineWidth = 0.5;
      
      projected.forEach((dot, i) => {
        projected.slice(i + 1).forEach(otherDot => {
          const distance = Math.sqrt(
            Math.pow(dot.x - otherDot.x, 2) + 
            Math.pow(dot.y - otherDot.y, 2)
          );
          
          if (distance < 30) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(otherDot.x, otherDot.y);
            ctx.stroke();
          }
        });
      });
      
      // Draw dots
      projected.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.scale * 2, 0, Math.PI * 2);
        ctx.fillStyle = isHovered 
          ? `rgba(13, 255, 231, ${dot.alpha})`
          : `rgba(147, 51, 234, ${dot.alpha})`;
        ctx.fill();
      });
      
      rotation += isHovered ? 0.015 : 0.005;
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered]);
  
  return (
    <Link to="/map" className="globe-link">
      <motion.div 
        className="interactive-globe-container"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <canvas ref={canvasRef} className="globe-canvas" />
        <div className="globe-glow" />
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
          <source src="/assets/images/hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Video overlay for better contrast */}
        <div className="video-overlay" />
        
        {/* Interactive Globe - Only element in hero */}
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: videoLoaded ? 1 : 0, scale: videoLoaded ? 1 : 0.8 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <InteractiveGlobe />
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