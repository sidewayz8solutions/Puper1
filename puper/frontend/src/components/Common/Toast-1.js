import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa';
import './Toast.css';

const Toast = ({ message, type = 'info', isVisible, onClose, duration = 5000 }) => {
  const icons = {
    success: <FaCheck />,
    error: <FaExclamationTriangle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfo />
  };

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`toast toast-${type}`}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="toast-icon">
            {icons[type]}
          </div>
          <div className="toast-message">
            {message}
          </div>
          <button className="toast-close" onClick={onClose}>
            <FaTimes />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
