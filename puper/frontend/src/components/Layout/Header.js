import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  // Close mobile nav when route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileNavOpen]);

  const handleLogout = () => {
    logout();
    setMobileNavOpen(false);
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/map', label: 'Map' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/about', label: 'About' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          PÜPER
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <ul className="nav-links-desktop">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop User Menu */}
          {user ? (
            <div className="user-menu-desktop" ref={dropdownRef}>
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.name}
                className="user-avatar-desktop"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              />
              <div className={`user-dropdown ${userDropdownOpen ? 'open' : ''}`}>
                <Link to={`/profile/${user.id}`} className="dropdown-item">
                  Profile
                </Link>
                <Link to="/settings" className="dropdown-item">
                  Settings
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              className="auth-button"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile Navigation Toggle */}
        <button
          className={`mobile-nav-toggle ${mobileNavOpen ? 'active' : ''}`}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`nav-mobile-overlay ${mobileNavOpen ? 'open' : ''}`} 
           onClick={() => setMobileNavOpen(false)} />
      
      <nav className={`nav-mobile ${mobileNavOpen ? 'open' : ''}`}>
        <ul className="nav-links-mobile">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileNavOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile User Menu */}
        <div className="user-menu-mobile">
          {user ? (
            <>
              <div className="user-avatar-mobile">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.name}
                />
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <Link
                to={`/profile/${user.id}`}
                className="nav-link"
                onClick={() => setMobileNavOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="nav-link"
                onClick={() => setMobileNavOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link"
                style={{ 
                  background: 'rgba(255, 0, 0, 0.1)', 
                  marginTop: '1rem',
                  textAlign: 'center'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="auth-button"
              onClick={() => {
                setMobileNavOpen(false);
                navigate('/login');
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;