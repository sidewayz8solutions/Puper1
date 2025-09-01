import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRoute, FaPlus } from 'react-icons/fa';
import Button from '../Common/Button';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
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
        </div>
      </div>
    </section>
  );
};

export default Hero;
