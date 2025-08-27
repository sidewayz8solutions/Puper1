import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRoute, FaPlus, FaUser, FaTrophy, FaSignOutAlt } from 'react-icons/fa';
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
          
          {isAuthenticated && user ? (
            <>
              <Link to={`/profile/${user.id}`} className="nav-item" title={`Logged in as ${user.displayName || user.username}`}>
                <FaUser /> {user.displayName || user.username || 'Profile'}
              </Link>
              <button onClick={logout} className="nav-item" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)} className="nav-item">
              Login
            </button>
          )}
        </nav>
      </div>

      {showLogin && !isAuthenticated && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
};

export default Header;
