import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRoute, FaPlus, FaUser, FaTrophy } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../User/LoginModal';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-section">
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src="/puper-logo.png" alt="Püper Logo" className="logo-icon" />
          </motion.div>
          <div>
            <h1 className="app-title">PÜPER</h1>
            <p className="tagline">Your Guide to Relief</p>
          </div>
        </Link>

        <nav className="nav-menu">
          <Link to="/map" className="nav-item">
            <FaRoute /> Map
          </Link>
          <Link to="/map?add=true" className="nav-item">
            <FaPlus /> Add Restroom
          </Link>
          <Link to="/leaderboard" className="nav-item">
            <FaTrophy /> Leaderboard
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to={`/profile/${user?.id}`} className="nav-item">
                <FaUser /> Profile
              </Link>
              <button onClick={logout} className="nav-item">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)} className="nav-item">
              Login
            </button>
          )}
        </nav>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
};

export default Header;
