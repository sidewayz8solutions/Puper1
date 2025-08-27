import React, { useState } from 'react';
import { useGeospatialRestrooms } from '../../hooks/useGeospatialRestrooms';
import './GeospatialTest.css';

const GeospatialTest = () => {
  const {
    restrooms,
    loading,
    error,
    findNearbyRestrooms,
    searchRestrooms,
    findClosestRestrooms,
    addRestroom,
    clearError
  } = useGeospatialRestrooms();

  const [testLocation, setTestLocation] = useState({
    lat: 37.0902, // USA center
    lon: -95.7129
  });
  const [radius, setRadius] = useState(5000);
  const [searchQuery, setSearchQuery] = useState('');

  // Test nearby restrooms
  const testNearby = async () => {
    await findNearbyRestrooms(testLocation.lat, testLocation.lon, radius);
  };

  // Test search functionality
  const testSearch = async () => {
    if (searchQuery.trim()) {
      await searchRestrooms(searchQuery, testLocation.lat, testLocation.lon, radius);
    }
  };

  // Test closest restrooms
  const testClosest = async () => {
    await findClosestRestrooms(testLocation.lat, testLocation.lon, 3);
  };

  // Test adding a new restroom
  const testAddRestroom = async () => {
    const newRestroom = {
      name: 'Test Restroom',
      description: 'A test restroom for geospatial testing',
      lat: testLocation.lat + 0.001,
      lon: testLocation.lon + 0.001,
      address: '123 Test St, New Orleans, LA',
      accessibility_features: {
        wheelchair_accessible: true,
        baby_changing: true
      },
      amenities: {
        hand_dryer: true,
        soap_dispenser: true
      },
      is_free: true
    };

    try {
      await addRestroom(newRestroom);
      alert('Test restroom added successfully!');
    } catch (err) {
      alert(`Error adding restroom: ${err.message}`);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTestLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          alert('Error getting location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="geospatial-test">
      <h2>🗺️ Geospatial Restroom Testing</h2>
      
      {error && (
        <div className="error-banner">
          <p>❌ Error: {error}</p>
          <button onClick={clearError}>Clear Error</button>
        </div>
      )}

      <div className="test-controls">
        <div className="location-controls">
          <h3>📍 Test Location</h3>
          <div className="input-group">
            <label>Latitude:</label>
            <input
              type="number"
              step="0.000001"
              value={testLocation.lat}
              onChange={(e) => setTestLocation({...testLocation, lat: parseFloat(e.target.value)})}
            />
          </div>
          <div className="input-group">
            <label>Longitude:</label>
            <input
              type="number"
              step="0.000001"
              value={testLocation.lon}
              onChange={(e) => setTestLocation({...testLocation, lon: parseFloat(e.target.value)})}
            />
          </div>
          <button onClick={getCurrentLocation} className="location-btn">
            📱 Use My Location
          </button>
        </div>

        <div className="search-controls">
          <h3>🔍 Search Parameters</h3>
          <div className="input-group">
            <label>Search Radius (meters):</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>Search Query:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., wheelchair accessible"
            />
          </div>
        </div>
      </div>

      <div className="test-buttons">
        <button onClick={testNearby} disabled={loading} className="test-btn">
          🎯 Find Nearby Restrooms
        </button>
        <button onClick={testSearch} disabled={loading || !searchQuery.trim()} className="test-btn">
          🔍 Search Restrooms
        </button>
        <button onClick={testClosest} disabled={loading} className="test-btn">
          📏 Find Closest Restrooms
        </button>
        <button onClick={testAddRestroom} disabled={loading} className="test-btn">
          ➕ Add Test Restroom
        </button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading restrooms...</p>
        </div>
      )}

      <div className="results">
        <h3>📊 Results ({restrooms.length} restrooms found)</h3>
        {restrooms.length === 0 && !loading && (
          <p className="no-results">No restrooms found. Try adjusting your search parameters.</p>
        )}
        
        <div className="restroom-list">
          {restrooms.map((restroom, index) => (
            <div key={restroom.id || index} className="restroom-card">
              <h4>{restroom.name}</h4>
              <p className="description">{restroom.description}</p>
              <div className="restroom-details">
                <p><strong>📍 Location:</strong> {restroom.lat.toFixed(6)}, {restroom.lon.toFixed(6)}</p>
                <p><strong>📏 Distance:</strong> {restroom.distance_meters ? `${restroom.distance_meters}m` : 'N/A'}</p>
                <p><strong>⭐ Rating:</strong> {restroom.avg_rating ? `${restroom.avg_rating.toFixed(1)}/5` : 'No ratings'}</p>
                <p><strong>💬 Reviews:</strong> {restroom.review_count || 0}</p>
                <p><strong>💰 Free:</strong> {restroom.is_free ? '✅ Yes' : '❌ No'}</p>
                {restroom.accessibility_features && (
                  <div className="features">
                    <strong>♿ Accessibility:</strong>
                    {restroom.accessibility_features.wheelchair_accessible && ' Wheelchair '}
                    {restroom.accessibility_features.baby_changing && ' Baby Changing '}
                    {restroom.accessibility_features.gender_neutral && ' Gender Neutral '}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeospatialTest;
