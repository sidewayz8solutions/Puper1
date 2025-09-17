import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaStar, 
  FaClock, 
  FaToilet,
  FaThumbsUp,
  FaComment,
  FaCamera,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { ToiletRatingSelector } from './ToiletRatingSelector';
import RestroomRatingModal from './RestroomRatingModal';
import authService from '../../services/auth';
import './RestroomCard.css';

const RestroomCard = ({ 
  restroom, 
  onRatingSubmitted,
  showRatingButton = true 
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const handleRatingClick = () => {
    if (!isAuthenticated) {
      // Redirect to sign in page
      window.location.href = '/signin';
      return;
    }
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = (ratingData) => {
    onRatingSubmitted?.(ratingData);
    setShowRatingModal(false);
  };

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatWaitTime = (waitTime) => {
    if (waitTime === 0) return 'No wait';
    if (waitTime <= 2) return '1-2 min';
    if (waitTime <= 5) return '3-5 min';
    if (waitTime <= 10) return '6-10 min';
    if (waitTime <= 20) return '11-20 min';
    return '20+ min';
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      soap: '🧼',
      paperTowels: '🧻',
      toiletPaper: '📄',
      handDryer: '🌪️',
      changingTable: '👶',
      accessible: '♿'
    };
    return icons[amenity] || '✅';
  };

  return (
    <>
      <motion.div 
        className="restroom-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
      >
        {/* Header */}
        <div className="card-header">
          <div className="restroom-info">
            <h3 className="restroom-name">{restroom.name}</h3>
            <div className="restroom-location">
              <FaMapMarkerAlt className="location-icon" />
              <span className="address">{restroom.address}</span>
            </div>
          </div>
          {restroom.distance && (
            <div className="distance-badge">
              {formatDistance(restroom.distance)}
            </div>
          )}
        </div>

        {/* Rating Display */}
        <div className="rating-section">
          <div className="rating-display">
            <ToiletRatingSelector
              rating={restroom.rating || 0}
              onRatingChange={() => {}} // Read-only
              size="medium"
            />
            <div className="rating-details">
              <span className="rating-text">
                {restroom.rating ? `${restroom.rating.toFixed(1)}/5` : 'No rating'}
              </span>
              {restroom.reviews && (
                <span className="review-count">
                  ({restroom.reviews} review{restroom.reviews !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        {restroom.amenities && Object.keys(restroom.amenities).length > 0 && (
          <div className="amenities-section">
            <h4>Available Amenities</h4>
            <div className="amenities-list">
              {Object.entries(restroom.amenities).map(([amenity, available]) => (
                available && (
                  <span key={amenity} className="amenity-item">
                    <span className="amenity-icon">{getAmenityIcon(amenity)}</span>
                    <span className="amenity-name">
                      {amenity.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="info-section">
          {restroom.waitTime !== undefined && (
            <div className="info-item">
              <FaClock className="info-icon" />
              <span>Wait: {formatWaitTime(restroom.waitTime)}</span>
            </div>
          )}
          {restroom.lastCleaned && (
            <div className="info-item">
              <FaStar className="info-icon" />
              <span>Last cleaned: {new Date(restroom.lastCleaned).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Photos Preview */}
        {restroom.photos && restroom.photos.length > 0 && (
          <div className="photos-section">
            <div className="photos-preview">
              {restroom.photos.slice(0, 3).map((photo, index) => (
                <div key={index} className="photo-thumbnail">
                  <img src={photo} alt={`Restroom photo ${index + 1}`} />
                </div>
              ))}
              {restroom.photos.length > 3 && (
                <div className="more-photos">
                  +{restroom.photos.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions">
          {showRatingButton && (
            <motion.button
              className="rate-button"
              onClick={handleRatingClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaThumbsUp />
              {isAuthenticated ? 'Rate This Restroom' : 'Sign In to Rate'}
            </motion.button>
          )}
          
          <motion.button
            className="navigate-button"
            onClick={() => {
              // Open in maps app
              const url = `https://maps.google.com/?q=${encodeURIComponent(restroom.address)}`;
              window.open(url, '_blank');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaExternalLinkAlt />
            Navigate
          </motion.button>
        </div>
      </motion.div>

      {/* Rating Modal */}
      <RestroomRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        restroom={restroom}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </>
  );
};

export default RestroomCard;
