import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaToilet, FaWheelchair, FaBaby, FaTransgender, FaDollarSign, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import ReviewForm from '../Review/ReviewForm';
import Button from '../Common/Button';
import './RestroomDetail.css';

const RestroomDetail = ({ restroom, onClose }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const renderToilets = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FaToilet
        key={i}
        className={i < Math.round(rating) ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restroom.lat},${restroom.lon}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        className="restroom-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="restroom-detail"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="detail-header">
            <h2>{restroom.name}</h2>
            <button onClick={onClose} className="close-btn">
              <FaTimes />
            </button>
          </div>

          <div className="detail-content">
            <div className="restroom-info">
              <div className="rating-section">
                <div className="stars">{renderToilets(restroom.avg_rating || 0)}</div>
                <span className="rating-text">
                  {(restroom.avg_rating || 0).toFixed(1)} ({restroom.review_count || 0} reviews)
                </span>
              </div>

              {restroom.address && (
                <div className="address-section">
                  <FaMapMarkerAlt />
                  <span>{restroom.address}</span>
                </div>
              )}

              <div className="amenities-section">
                <h3>Amenities</h3>
                <div className="amenities-list">
                  {restroom.wheelchair_accessible && (
                    <div className="amenity">
                      <FaWheelchair />
                      <span>Wheelchair Accessible</span>
                    </div>
                  )}
                  {restroom.baby_changing && (
                    <div className="amenity">
                      <FaBaby />
                      <span>Baby Changing Station</span>
                    </div>
                  )}
                  {restroom.gender_neutral && (
                    <div className="amenity">
                      <FaTransgender />
                      <span>Gender Neutral</span>
                    </div>
                  )}
                  <div className="amenity">
                    <FaDollarSign />
                    <span>{restroom.requires_fee ? 'Fee Required' : 'Free'}</span>
                  </div>
                </div>
              </div>

              {restroom.opening_hours && (
                <div className="hours-section">
                  <h3>Hours</h3>
                  <div className="hours-list">
                    {Object.entries(restroom.opening_hours).map(([day, hours]) => (
                      <div key={day} className="hours-item">
                        <span className="day">{day}</span>
                        <span className="hours">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="detail-actions">
              <Button onClick={getDirections} className="directions-btn">
                <FaRoute /> Get Directions
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowReviewForm(true)}
                className="review-btn"
              >
                <FaStar /> Write Review
              </Button>
            </div>

            {showReviewForm && (
              <div className="review-form-section">
                <ReviewForm 
                  restroomId={restroom.id}
                  onSuccess={() => {
                    setShowReviewForm(false);
                    // Refresh restroom data
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RestroomDetail;
