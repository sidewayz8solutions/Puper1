import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaToilet, FaUser, FaSignOutAlt, FaSignInAlt, FaMapMarkerAlt, FaPlus, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to navigate away
      navigate('/');
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaToilet className="logo-icon" />
          <span className="logo-text">PÜPER</span>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/map" className="navbar-item" onClick={() => setIsOpen(false)}>
            <FaMapMarkerAlt />
            <span>Find Restrooms</span>
          </Link>

          <Link to="/map?add=true" className="navbar-item" onClick={() => setIsOpen(false)}>
            <FaPlus />
            <span>Add Restroom</span>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="navbar-item" onClick={() => setIsOpen(false)}>
                <FaUser />
                <span>Dashboard</span>
              </Link>
              
              <button 
                className="navbar-item logout-btn"
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="navbar-item login-btn"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'linear-gradient(135deg, #4B0082, #8A2BE2)',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 'bold'
              }}
            >
              <FaSignInAlt />
              <span>Login</span>
            </Link>
          )}
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;