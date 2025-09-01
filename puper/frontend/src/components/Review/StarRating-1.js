import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaToilet } from 'react-icons/fa';
import './StarRating.css';

const StarRating = ({ value = 0, onChange, readonly = false, size = 'medium' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  return (
    <div className={`star-rating star-rating-${size}`}>
      {[1, 2, 3, 4, 5].map((toilet) => (
        <motion.button
          key={toilet}
          type="button"
          className={`star ${
            toilet <= (hoverValue || value) ? 'star-filled' : 'star-empty'
          }`}
          onClick={() => handleClick(toilet)}
          onMouseEnter={() => handleMouseEnter(toilet)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          whileHover={!readonly ? { scale: 1.1 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          aria-label={`${toilet} toilet rating`}
          title={`${toilet} toilet rating`}
        >
          <FaToilet />
        </motion.button>
      ))}
    </div>
  );
};

export default StarRating;
