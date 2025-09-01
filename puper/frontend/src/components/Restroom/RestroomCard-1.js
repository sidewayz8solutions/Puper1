import React from 'react';
import { motion } from 'framer-motion';
import { FaToilet, FaWheelchair, FaBaby, FaTransgender, FaDollarSign, FaWalking } from 'react-icons/fa';
import './RestroomCard.css';

const RestroomCard = ({ restroom, onClick }) => {
  const renderToilets = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FaToilet
        key={i}
        className={i < Math.round(rating) ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  return (
    <motion.div 
      className="restroom-card"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <h4 className="restroom-name">{restroom.name}</h4>
      
      <div className="restroom-rating">
        <div className="stars">{renderToilets(restroom.avg_rating || 0)}</div>
        <span className="review-count">({restroom.review_count || 0} reviews)</span>
      </div>
      
      <div className="restroom-distance">
        <FaWalking /> {(restroom.distance / 1000).toFixed(2)} km away
      </div>
      
      <div className="restroom-amenities">
        {restroom.wheelchair_accessible && (
          <div className="amenity-icon" title="Wheelchair Accessible">
            <FaWheelchair />
          </div>
        )}
        {restroom.baby_changing && (
          <div className="amenity-icon" title="Baby Changing">
            <FaBaby />
          </div>
        )}
        {restroom.gender_neutral && (
          <div className="amenity-icon" title="Gender Neutral">
            <FaTransgender />
          </div>
        )}
        {!restroom.requires_fee && (
          <div className="amenity-icon" title="Free">
            <FaDollarSign />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RestroomCard;
