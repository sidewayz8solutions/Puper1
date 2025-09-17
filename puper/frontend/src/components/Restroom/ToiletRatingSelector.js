import React from 'react';
import './ToiletRatingSelector.css';

const ToiletRatingSelector = ({ 
  rating = 0, 
  onRatingChange, 
  size = 'medium',
  readOnly = false 
}) => {
  const handleToiletClick = (index) => {
    if (readOnly || !onRatingChange) return;
    
    // Toggle between full and empty
    const newRating = rating === index + 1 ? index : index + 1;
    onRatingChange(newRating);
  };

  const getToiletEmoji = (index) => {
    if (index < rating) {
      return '🚽'; // Full toilet
    } else if (index === Math.floor(rating) && rating % 1 >= 0.5) {
      return '🚽'; // Half toilet (same emoji but with opacity)
    } else {
      return '🚾'; // Empty toilet
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'toilet-small';
      case 'large': return 'toilet-large';
      default: return 'toilet-medium';
    }
  };

  return (
    <div className={`toilet-rating-selector ${getSizeClass()}`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <button
          key={index}
          type="button"
          className={`toilet-button ${index < rating ? 'active' : ''} ${readOnly ? 'read-only' : ''}`}
          onClick={() => handleToiletClick(index)}
          disabled={readOnly}
          aria-label={`Rate ${index + 1} out of 5`}
        >
          <span 
            className={`toilet-emoji ${index === Math.floor(rating) && rating % 1 >= 0.5 ? 'half' : ''}`}
          >
            {getToiletEmoji(index)}
          </span>
        </button>
      ))}
    </div>
  );
};

export { ToiletRatingSelector };
export default ToiletRatingSelector;
