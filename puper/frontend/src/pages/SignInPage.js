import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaEye, 
  FaEyeSlash, 
  FaGoogle, 
  FaEnvelope, 
  FaLock, 
  FaUser,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import authService from '../services/auth';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { user, error } = await authService.signUp(
          formData.email,
          formData.password,
          {
            displayName: formData.displayName,
            bio: formData.bio
          }
        );

        if (error) {
          setError(error);
        } else {
          setSuccess('Account created successfully! Please check your email to verify your account.');
          setTimeout(() => {
            setIsSignUp(false);
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              displayName: '',
              bio: ''
            });
          }, 2000);
        }
      } else {
        const { user, error } = await authService.signIn(
          formData.email,
          formData.password
        );

        if (error) {
          setError(error);
        } else {
          setSuccess('Signed in successfully!');
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) {
        setError(error);
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await authService.resetPassword(formData.email);
      if (error) {
        setError(error);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <motion.div 
          className="signin-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="signin-header">
            <Link to="/" className="back-button">
              <FaArrowLeft />
            </Link>
            <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p>{isSignUp ? 'Join the Puper community' : 'Sign in to track your ratings'}</p>
          </div>

          {error && (
            <motion.div 
              className="alert error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FaExclamationCircle />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              className="alert success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FaCheckCircle />
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="signin-form">
            {isSignUp && (
              <div className="input-group">
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="displayName"
                    placeholder="Display Name"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="input-group">
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}

            {isSignUp && (
              <div className="input-group">
                <div className="input-wrapper">
                  <textarea
                    name="bio"
                    placeholder="Tell us about yourself (optional)"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
            )}

            <motion.button
              type="submit"
              className="submit-button"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </motion.button>

            {!isSignUp && (
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot Password?
              </button>
            )}
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <motion.button
            className="google-button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaGoogle />
            Continue with Google
          </motion.button>

          <div className="signin-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                className="toggle-mode"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    displayName: '',
                    bio: ''
                  });
                }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage;
