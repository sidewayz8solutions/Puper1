import React from 'react';
import { motion } from 'framer-motion';
import './Loading.css';

const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <motion.div
        className="loading-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading;
