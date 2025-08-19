import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  className,
  ...props 
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {loading ? (
        <span className="btn-loading">Loading...</span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
