import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaLock, FaEnvelope, FaToilet, FaGoogle, FaGithub } from 'react-icons/fa';
import woodBg from '../assets/images/wood5.png';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, loginWithGithub } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, username);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);

    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else if (provider === 'github') {
        await loginWithGithub();
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Social login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="login-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <div className="animated-bg">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-element"
            initial={{ y: '100vh', x: Math.random() * 100 + 'vw' }}
            animate={{ y: '-100vh' }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              fontSize: '2rem',
              opacity: 0.1,
              color: 'white'
            }}
          >
            {i % 3 === 0 ? '🚽' : i % 3 === 1 ? '🧻' : '🚿'}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="login-container"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '450px',
          padding: '3rem',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Logo Section */}
        <motion.div 
          className="login-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <div className="logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            <FaToilet style={{ color: '#4B0082' }} />
          </div>
          <h2 style={{ 
            fontFamily: 'Bebas Neue, cursive',
            fontSize: '2.5rem',
            color: '#4B0082',
            letterSpacing: '3px',
            marginBottom: '0.5rem'
          }}>
            PÜPER
          </h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            {isLogin ? 'Welcome Back!' : 'Join the Community'}
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="auth-tabs" style={{
          display: 'flex',
          marginBottom: '2rem',
          background: '#f5f5f5',
          borderRadius: '10px',
          padding: '0.25rem'
        }}>
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: isLogin ? '#4B0082' : 'transparent',
              color: isLogin ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: !isLogin ? '#4B0082' : 'transparent',
              color: !isLogin ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
            style={{
              background: '#ff6b6b',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease'
                }}>
                  <FaUser style={{ 
                    position: 'absolute',
                    left: '1rem',
                    color: '#666',
                    fontSize: '1.1rem'
                  }} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#f8f9fa',
              borderRadius: '10px',
              border: '2px solid transparent',
              transition: 'all 0.3s ease'
            }}>
              <FaEnvelope style={{ 
                position: 'absolute',
                left: '1rem',
                color: '#666',
                fontSize: '1.1rem'
              }} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#f8f9fa',
              borderRadius: '10px',
              border: '2px solid transparent',
              transition: 'all 0.3s ease'
            }}>
              <FaLock style={{ 
                position: 'absolute',
                left: '1rem',
                color: '#666',
                fontSize: '1.1rem'
              }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {isLogin && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: '#666',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
                <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                Remember me
              </label>
              <a href="/forgot-password" style={{
                color: '#4B0082',
                fontSize: '0.9rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Forgot password?
              </a>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #4B0082, #8A2BE2)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 15px rgba(75, 0, 130, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </motion.button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '2rem 0',
          color: '#999',
          fontSize: '0.9rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
          <span style={{ padding: '0 1rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
        </div>

        {/* Social Login */}
        <div className="social-buttons" style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <motion.button
            type="button"
            onClick={() => handleSocialLogin('google')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'white',
              border: '2px solid #ea4335',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#ea4335',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <FaGoogle />
            Google
          </motion.button>

          <motion.button
            type="button"
            onClick={() => handleSocialLogin('github')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'white',
              border: '2px solid #333',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#333',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <FaGithub />
            GitHub
          </motion.button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              color: '#4B0082',
              fontWeight: 'bold',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;