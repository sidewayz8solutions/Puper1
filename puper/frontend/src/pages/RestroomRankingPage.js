import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt, FaClock, FaToilet, FaHeart, FaNavigation,
  FaFilter, FaRefresh, FaTrophy, FaMedal, FaCrown, FaStar
} from 'react-icons/fa';
import { getNearbyRestrooms } from '../services/restrooms';
import './RestroomRankingPage.css';

const RestroomRankingPage = () => {
  const navigate = useNavigate();
  const [restrooms, setRestrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentArea, setCurrentArea] = useState('Loading...');
  const fadeAnim = useRef({ opacity: 0 });
  const slideAnim = useRef({ y: 50 });

  // Fetch restrooms based on location
  const fetchRestrooms = async (latitude, longitude) => {
    try {
      const data = await getNearbyRestrooms(latitude, longitude, { radius: 10000 });
      
      // Sort by rating (best to worst) and add rank
      const sortedRestrooms = data
        .filter(restroom => restroom.overall_rating || restroom.avg_rating)
        .sort((a, b) => (b.overall_rating || b.avg_rating || 0) - (a.overall_rating || a.avg_rating || 0))
        .map((restroom, index) => ({
          ...restroom,
          rank: index + 1,
          rating: restroom.overall_rating || restroom.avg_rating || 0,
          reviews: restroom.review_count || 0,
          distance: restroom.distance ? (restroom.distance / 1609.34).toFixed(1) : '0.0', // Convert meters to miles
          cleanliness: restroom.cleanliness_rating || restroom.rating || 0,
          amenities: getAmenities(restroom),
          lastCleaned: getLastCleaned(),
          waitTime: getWaitTime(),
          image: getRestroomImage(restroom)
        }));

      setRestrooms(sortedRestrooms);
    } catch (error) {
      console.error('Error fetching restrooms:', error);
      // Fallback to mock data if API fails
      setRestrooms(getMockRestrooms());
    }
  };

  // Helper functions
  const getAmenities = (restroom) => {
    const amenities = [];
    if (restroom.wheelchair_accessible) amenities.push('Handicap Accessible');
    if (restroom.baby_changing) amenities.push('Baby Changing');
    if (restroom.gender_neutral) amenities.push('Gender Neutral');
    amenities.push('Soap', 'Paper Towels'); // Default amenities
    return amenities;
  };

  const getLastCleaned = () => {
    const options = ['Just cleaned', '30 min ago', '1 hour ago', '2 hours ago', '4 hours ago'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getWaitTime = () => {
    const options = ['No wait', '2-3 min', '5 min'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getRestroomImage = (restroom) => {
    return `https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=${encodeURIComponent(restroom.name?.charAt(0) || 'R')}`;
  };

  const getMockRestrooms = () => [
    {
      id: '1',
      name: 'Central Park Public Restroom',
      address: '123 Park Ave',
      rating: 4.8,
      reviews: 234,
      distance: '0.3',
      cleanliness: 4.9,
      amenities: ['Soap', 'Paper Towels', 'Handicap Accessible', 'Baby Changing'],
      lastCleaned: '2 hours ago',
      waitTime: 'No wait',
      image: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=C',
      rank: 1
    }
  ];

  // Get current location
  const getCurrentLocation = async () => {
    try {
      if (!navigator.geolocation) {
        setCurrentArea('Geolocation not supported');
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });

      // Get area name (simplified)
      setCurrentArea('Current Location');

      // Fetch restrooms for this location
      await fetchRestrooms(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrentArea('Location unavailable');
      setRestrooms(getMockRestrooms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    setRefreshing(false);
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return ['#FFD700', '#FFA500']; // Gold
      case 2: return ['#C0C0C0', '#808080']; // Silver
      case 3: return ['#CD7F32', '#8B4513']; // Bronze
      default: return ['#4A90E2', '#357ABD']; // Blue
    }
  };

  const getToiletRating = (rating) => {
    const toilets = [];
    const fullToilets = Math.floor(rating);
    const hasHalfToilet = rating % 1 >= 0.5;

    for (let i = 0; i < fullToilets; i++) {
      toilets.push(<FaToilet key={`full-${i}`} className="toilet-full" />);
    }

    if (hasHalfToilet && fullToilets < 5) {
      toilets.push(<FaToilet key="half" className="toilet-half" />);
    }

    const emptyToilets = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyToilets; i++) {
      toilets.push(<FaToilet key={`empty-${i}`} className="toilet-empty" />);
    }

    return toilets;
  };

  const RestroomCard = ({ restroom, index }) => {
    const handleNavigate = (e) => {
      e.stopPropagation();
      const url = `https://www.google.com/maps/dir/?api=1&destination=${restroom.lat},${restroom.lon || restroom.lng}`;
      window.open(url, '_blank');
    };
    
    const handleFavorite = (e) => {
      e.stopPropagation();
      // TODO: Implement favorite functionality
      alert('Favorite feature coming soon!');
    };
    
    return (
      <motion.div
        className="restroom-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={() => navigate(`/map?restroom=${restroom.id}`)}
      >
        <div className="rank-badge" style={{
          background: `linear-gradient(135deg, ${getRankBadgeColor(restroom.rank)[0]}, ${getRankBadgeColor(restroom.rank)[1]})`
        }}>
          <span className="rank-number">#{restroom.rank}</span>
        </div>

        <div className="card-content">
          <div className="card-left">
            <img
              src={restroom.image}
              alt={restroom.name}
              className="restroom-image"
            />
          </div>

          <div className="card-middle">
            <h3 className="restroom-name">{restroom.name}</h3>
            <p className="restroom-address">{restroom.address}</p>
            
            <div className="rating-container">
              <div className="toilet-rating">
                {getToiletRating(restroom.rating)}
              </div>
              <span className="rating-text">{restroom.rating.toFixed(1)}</span>
              <span className="review-count">({restroom.reviews})</span>
            </div>

            <div className="info-row">
              <div 
                className="info-badge"
                onClick={handleNavigate}
                aria-label="Get directions"
                style={{ cursor: 'pointer' }}
              >
                <FaMapMarkerAlt />
                <span>{restroom.distance} mi</span>
              </div>
              <div className="info-badge">
                <FaClock />
                <span>{restroom.waitTime}</span>
              </div>
            </div>
          </div>

          <div className="card-right">
            <button 
              className="action-button navigate-btn"
              onClick={handleNavigate}
              aria-label="Get directions"
            >
              <FaNavigation />
            </button>
            <button 
              className="action-button favorite-btn"
              onClick={handleFavorite}
              aria-label="Add to favorites"
            >
              <FaHeart />
            </button>
          </div>
        </div>

        <div className="amenities-container">
          {restroom.amenities.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="amenity-badge">{amenity}</span>
          ))}
          {restroom.amenities.length > 3 && (
            <span className="amenity-badge">+{restroom.amenities.length - 3}</span>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="ranking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding the best restrooms near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <div className="header-content">
          <div className="header-top">
            <button onClick={() => navigate(-1)} className="back-button">
              ←
            </button>
            <h1>Restroom Rankings</h1>
            <button onClick={() => {/* TODO: Add filter */}} className="filter-button">
              <FaFilter />
            </button>
          </div>
          
          <div className="location-container">
            <FaMapMarkerAlt />
            <span>{currentArea}</span>
            <button onClick={getCurrentLocation} className="refresh-button">
              <FaRefresh className={refreshing ? 'spinning' : ''} />
            </button>
          </div>

          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">{restrooms.length}</span>
              <span className="stat-label">Restrooms</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">
                {restrooms.length > 0 ? restrooms[0].rating.toFixed(1) : '-'}
              </span>
              <span className="stat-label">Top Rated</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">
                {restrooms.length > 0 ? restrooms[0].distance : '-'} mi
              </span>
              <span className="stat-label">Nearest</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        <div className="restrooms-list">
          {restrooms.map((restroom, index) => (
            <RestroomCard key={restroom.id} restroom={restroom} index={index} />
          ))}
          
          {restrooms.length === 0 && (
            <div className="empty-state">
              <FaToilet className="empty-icon" />
              <h3>No restrooms found</h3>
              <p>Try expanding your search radius or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestroomRankingPage;
