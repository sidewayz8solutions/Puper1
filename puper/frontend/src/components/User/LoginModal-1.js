import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import './LoginModal.css';
import { FaGoogle } from 'react-icons/fa';

const LoginModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, loginWithGoogle } = useAuth();
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = isLogin
        ? await login(data)
        : await register(data);

      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isLogin ? 'Login' : 'Sign Up'}>
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label>Display Name</label>
            <input
              {...formRegister('displayName')}
              type="text"
              placeholder="Your display name"
            />
          </div>
        )}

        <div className="form-group">
          <label>Username or Email</label>
          <input
            {...formRegister('username', { required: 'Username is required' })}
            type="text"
            placeholder="Enter username or email"
          />
          {errors.username && <span className="error">{errors.username.message}</span>}
        </div>

        {!isLogin && (
          <div className="form-group">
            <label>Email</label>
            <input
              {...formRegister('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              placeholder="Enter your email"
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Password</label>
          <input
            {...formRegister('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            type="password"
            placeholder="Enter password"
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <Button type="submit" loading={loading} className="auth-submit">
          {isLogin ? 'Login' : 'Sign Up'}
        </Button>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="switch-btn"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>

        <div className="oauth-divider"><span>or</span></div>

        <Button type="button" className="google-btn" onClick={loginWithGoogle}>
          <FaGoogle style={{ marginRight: 8 }} /> Continue with Google
        </Button>

        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;
