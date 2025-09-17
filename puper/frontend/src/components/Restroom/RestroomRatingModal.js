import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaStar, 
  FaToilet, 
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import { ToiletRatingSelector } from './ToiletRatingSelector';
import PhotoUpload from '../Common/PhotoUpload';
import authService from '../../services/auth';
import restroomService from '../../services/supabase';
import './RestroomRatingModal.css';

const RestroomRatingModal = ({ 
  isOpen, 
  onClose, 
  restroom, 
  onRatingSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [amenities, setAmenities] = useState({
    soap: false,
    paperTowels: false,
    toiletPaper: false,
    handDryer: false,
    changingTable: false,
    accessible: false
  });
  const [waitTime, setWaitTime] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setRating(0);
      setCleanliness(0);
      setAmenities({
        soap: false,
        paperTowels: false,
        toiletPaper: false,
        handDryer: false,
        changingTable: false,
        accessible: false
      });
      setWaitTime(0);
      setComment('');
      setPhotos([]);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleAmenityChange = (amenity) => {
    setAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }));
  };

  const handlePhotoUpload = (uploadedPhotos) => {
    setPhotos(uploadedPhotos);
  };

  const handlePhotoError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!authService.isAuthenticated()) {
      setError('Please sign in to submit a rating');
      return;
    }

    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const user = authService.getCurrentUser();
      const reviewData = {
        restroom_id: restroom.id,
        user_id: user.id,
        rating: rating,
        cleanliness: cleanliness,
        amenities: amenities,
        wait_time: waitTime,
        comment: comment.trim(),
        photos: photos.map(photo => photo.url),
        created_at: new Date().toISOString()
      };

      const { error: reviewError } = await restroomService.addReview(reviewData);
      
      if (reviewError) {
        throw new Error(reviewError);
      }

      setSuccess('Rating submitted successfully!');
      
      // Call the callback to refresh data
      onRatingSubmitted?.(reviewData);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Rating submission error:', err);
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="rating-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="rating-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="restroom-info">
              <h2>{restroom.name}</h2>
              <div className="restroom-details">
                <span className="location">
                  <FaMapMarkerAlt />
                  {restroom.address}
                </span>
              </div>
            </div>
            <button className="close-button" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="rating-form">
            {error && (
              <motion.div 
                className="alert error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FaExclamationCircle />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                className="alert success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FaCheckCircle />
                {success}
              </motion.div>
            )}

            {/* Overall Rating */}
            <div className="rating-section">
              <label className="section-label">
                <FaToilet />
                Overall Rating
              </label>
              <ToiletRatingSelector
                rating={rating}
                onRatingChange={setRating}
                size="large"
              />
            </div>

            {/* Cleanliness Rating */}
            <div className="rating-section">
              <label className="section-label">
                <FaStar />
                Cleanliness
              </label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= cleanliness ? 'active' : ''}`}
                    onClick={() => setCleanliness(star)}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="rating-section">
              <label className="section-label">Amenities Available</label>
              <div className="amenities-grid">
                {Object.entries(amenities).map(([amenity, available]) => (
                  <label key={amenity} className="amenity-item">
                    <input
                      type="checkbox"
                      checked={available}
                      onChange={() => handleAmenityChange(amenity)}
                    />
                    <span className="amenity-label">
                      {amenity.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Wait Time */}
            <div className="rating-section">
              <label className="section-label">
                <FaClock />
                Wait Time (minutes)
              </label>
              <select
                value={waitTime}
                onChange={(e) => setWaitTime(parseInt(e.target.value))}
                className="wait-time-select"
              >
                <option value={0}>No wait</option>
                <option value={1}>1-2 minutes</option>
                <option value={3}>3-5 minutes</option>
                <option value={8}>6-10 minutes</option>
                <option value={15}>11-20 minutes</option>
                <option value={30}>20+ minutes</option>
              </select>
            </div>

            {/* Comment */}
            <div className="rating-section">
              <label className="section-label">Additional Comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience or any additional details..."
                className="comment-textarea"
                rows="3"
                maxLength="500"
              />
              <div className="character-count">
                {comment.length}/500
              </div>
            </div>

            {/* Photo Upload */}
            <div className="rating-section">
              <PhotoUpload
                restroomId={restroom.id}
                onUploadComplete={handlePhotoUpload}
                onUploadError={handlePhotoError}
                maxPhotos={3}
              />
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                className="submit-button"
                disabled={submitting || rating === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? (
                  <div className="loading-spinner" />
                ) : (
                  'Submit Rating'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RestroomRatingModal;
