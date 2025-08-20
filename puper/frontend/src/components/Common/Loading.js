import React from 'react';
import { motion } from 'framer-motion';
import './Loading.css';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <motion.div 
      className="loading-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="loading-content">
        <div className="toilet-loader">
          <div className="toilet-bowl"></div>
          <div className="toilet-water"></div>
          <div className="toilet-flush"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </motion.div>
  );
};

export default Loading;