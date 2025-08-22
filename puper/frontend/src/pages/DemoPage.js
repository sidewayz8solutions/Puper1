import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaRoute } from 'react-icons/fa';
import { initGoogleMaps } from '../services/googleMaps';
import './DemoPage.css';

// Hero Section Component with 123.mp4
const VideoHeroSection = ({ onShowMap }) => {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        setVideoLoaded(true);
        setVideoError(false);
      };

      const handleError = () => {
        setVideoError(true);
        setVideoLoaded(false);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      // Try to play the video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay failed, will play on user interaction
          const handleUserInteraction = () => {
            video.play().catch(() => setVideoError(true));
          };
          document.addEventListener('click', handleUserInteraction, { once: true });
        });
      }

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <div className="demo-hero-container">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`demo-hero-video ${videoError ? 'video-hidden' : ''}`}
        poster="/puper-logo.png"
      >
        <source src={`${process.env.PUBLIC_URL}/123.mp4`} type="video/mp4" />
        <source src="/123.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Fallback Background */}
      <div className={`demo-video-fallback ${videoError || !videoLoaded ? 'show-fallback' : ''}`}></div>

      {/* Overlay Content */}
      <div className="demo-hero-overlay">
        <motion.div
          className="demo-hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="demo-logo">
            <img src="/puper-logo.png" alt="Püper Logo" className="demo-logo-image" />
          </div>
          <h1 className="demo-hero-title">PÜPER</h1>
          <p className="demo-hero-description">
            Find the best public restrooms with our 3D map technology.
            Your guide to relief, wherever you go.
          </p>
          <button
            onClick={onShowMap}
            className="demo-cta-button"
          >
            <FaRoute /> Explore 3D Map
          </button>
        </motion.div>
      </div>
    </div>
  );
};

// 3D Map Component
const Map3DComponent = ({ onGoBack }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      try {
        await initGoogleMaps();
        
        if (mapRef.current && !map) {
          const mapOptions = {
            center: { lat: 29.9511, lng: -90.0715 }, // New Orleans
            zoom: 18,
            mapTypeId: window.google.maps.MapTypeId.SATELLITE,
            tilt: 45, // 3D perspective
            heading: 90, // Rotation
            gestureHandling: 'greedy',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true,
            mapTypeControlOptions: {
              mapTypeIds: [
                window.google.maps.MapTypeId.ROADMAP,
                window.google.maps.MapTypeId.SATELLITE,
                window.google.maps.MapTypeId.HYBRID,
                window.google.maps.MapTypeId.TERRAIN
              ]
            }
          };

          const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
          setMap(newMap);
          setMapLoaded(true);

          // Add a sample marker
          new window.google.maps.Marker({
            position: { lat: 29.9511, lng: -90.0715 },
            map: newMap,
            title: 'Sample Restroom Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#6B4423;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#4A2F18;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="url(#grad1)"/>
                  <circle cx="20" cy="20" r="8" fill="white"/>
                  <text x="20" y="25" text-anchor="middle" fill="#6B4423" font-size="12" font-weight="bold">🚽</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(40, 50),
              anchor: new window.google.maps.Point(20, 50)
            }
          });
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initMap();
  }, [map]);

  return (
    <div className="demo-map-container">
      <div ref={mapRef} className="demo-map" />
      
      {!mapLoaded && (
        <div className="demo-map-loading">
          <div className="demo-loading-spinner"></div>
          <p>Loading 3D Map...</p>
        </div>
      )}

      <button
        onClick={onGoBack}
        className="demo-back-button"
      >
        <FaArrowLeft /> Back to Hero
      </button>
    </div>
  );
};

// Main Demo App Component
const DemoPage = () => {
  const [showMap, setShowMap] = useState(false);

  if (showMap) {
    return <Map3DComponent onGoBack={() => setShowMap(false)} />;
  }

  return <VideoHeroSection onShowMap={() => setShowMap(true)} />;
};

export default DemoPage;
