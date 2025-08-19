import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
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
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          className={`star ${
            star <= (hoverValue || value) ? 'star-filled' : 'star-empty'
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          whileHover={!readonly ? { scale: 1.1 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
        >
          <FaStar />
        </motion.button>
      ))}
    </div>
  );
};

export default StarRating;
