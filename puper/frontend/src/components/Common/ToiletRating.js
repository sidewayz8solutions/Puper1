import React, { useState } from 'react';
import './ToiletRating.css';

const ToiletRating = ({ 
  rating = 0, 
  onRatingChange = null, 
  size = 'medium', 
  readonly = false,
  showValue = true 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleClick = (value) => {
    if (readonly) return;
    setCurrentRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (readonly) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const getToiletClass = (index) => {
    const value = index + 1;
    const displayRating = hoverRating || currentRating;
    
    let className = `toilet-icon ${size}`;
    
    if (value <= displayRating) {
      className += ' filled';
    } else {
      className += ' empty';
    }
    
    if (!readonly) {
      className += ' interactive';
    }
    
    return className;
  };

  return (
    <div className="toilet-rating">
      <div className="toilet-icons">
        {[0, 1, 2, 3, 4].map((index) => (
          <span
            key={index}
            className={getToiletClass(index)}
            onClick={() => handleClick(index + 1)}
            onMouseEnter={() => handleMouseEnter(index + 1)}
            onMouseLeave={handleMouseLeave}
            title={`${index + 1} toilet${index === 0 ? '' : 's'}`}
          >
            🚽
          </span>
        ))}
      </div>
      {showValue && (
        <span className="rating-value">
          {currentRating > 0 ? `${currentRating}/5` : 'No rating'}
        </span>
      )}
    </div>
  );
};

export default ToiletRating;
