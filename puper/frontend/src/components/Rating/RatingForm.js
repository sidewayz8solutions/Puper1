import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToiletRating from '../Common/ToiletRating';
import { FaTimes, FaCheck } from 'react-icons/fa';
import './RatingForm.css';

const RatingForm = ({ 
  restroom, 
  onSubmit, 
  onCancel, 
  existingRating = null 
}) => {
  const [ratings, setRatings] = useState({
    cleanliness: existingRating?.cleanliness_rating || 0,
    lighting: existingRating?.lighting_rating || 0,
    supplies: existingRating?.supplies_rating || 0,
    safety: existingRating?.safety_rating || 0,
    accessibility: existingRating?.accessibility_rating || 0
  });
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const ratingCategories = [
    { key: 'cleanliness', label: 'Cleanliness', icon: '🧽' },
    { key: 'lighting', label: 'Lighting', icon: '💡' },
    { key: 'supplies', label: 'Supplies', icon: '🧻' },
    { key: 'safety', label: 'Safety', icon: '🔒' },
    { key: 'accessibility', label: 'Accessibility', icon: '♿' }
  ];

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const calculateOverallRating = () => {
    const values = Object.values(ratings).filter(r => r > 0);
    if (values.length === 0) return 0;
    return (values.reduce((sum, rating) => sum + rating, 0) / values.length).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const ratingCount = Object.values(ratings).filter(r => r > 0).length;
    if (ratingCount === 0) {
      alert('Please provide at least one rating');
      return;
    }

    setSubmitting(true);
    
    try {
      await onSubmit({
        restroom_id: restroom.id,
        cleanliness_rating: ratings.cleanliness || null,
        lighting_rating: ratings.lighting || null,
        supplies_rating: ratings.supplies || null,
        safety_rating: ratings.safety || null,
        accessibility_rating: ratings.accessibility || null,
        overall_rating: calculateOverallRating(),
        comment: comment.trim() || null
      });
    } catch (error) {
      console.error('Rating submission error:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="rating-form-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rating-form-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="rating-form-header">
          <h3>Rate This Restroom</h3>
          <button onClick={onCancel} className="close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="restroom-info">
          <h4>{restroom.name}</h4>
          <p>{restroom.address}</p>
        </div>

        <form onSubmit={handleSubmit} className="rating-form">
          <div className="rating-categories">
            {ratingCategories.map(category => (
              <div key={category.key} className="rating-category">
                <div className="category-header">
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{category.label}</span>
                </div>
                <ToiletRating
                  rating={ratings[category.key]}
                  onRatingChange={(value) => handleRatingChange(category.key, value)}
                  size="large"
                  readonly={false}
                  showValue={false}
                />
              </div>
            ))}
          </div>

          <div className="overall-rating">
            <h4>Overall Rating</h4>
            <div className="overall-display">
              <ToiletRating
                rating={Math.round(calculateOverallRating())}
                readonly={true}
                size="xlarge"
                showValue={true}
              />
            </div>
          </div>

          <div className="comment-section">
            <label htmlFor="comment">Additional Comments (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
              maxLength="500"
            />
            <div className="char-count">{comment.length}/500</div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || Object.values(ratings).every(r => r === 0)}
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <FaCheck /> Submit Rating
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default RatingForm;
