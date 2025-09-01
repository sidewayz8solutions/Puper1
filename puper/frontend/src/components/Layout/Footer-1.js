import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import woodBg from '../../assets/images/wood.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" style={{ backgroundImage: `url(${woodBg})` }}>
      <div className="footer-content">
        <div className="footer-section">
          <h3>Püper</h3>
          <p>Making public restrooms accessible to everyone, everywhere.</p>
          <div className="social-links">
            <a href="#" aria-label="GitHub"><FaGithub /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/map">Find Restrooms</Link></li>
            <li><Link to="/leaderboard">Leaderboard</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#help">Help Center</a></li>
            <li><a href="#contact">Contact Us</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>
          Made with <FaHeart className="heart" /> for everyone who needs to go
        </p>
        <p>&copy; 2024 Püper. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
