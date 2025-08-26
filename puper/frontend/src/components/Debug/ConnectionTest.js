import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { initGoogleMaps } from '../../services/googleMaps';
import './ConnectionTest.css';

const ConnectionTest = () => {
  const [tests, setTests] = useState({
    supabase: { status: 'testing', message: 'Testing Supabase connection...' },
    googleMaps: { status: 'testing', message: 'Testing Google Maps API...' },
    restrooms: { status: 'testing', message: 'Testing restroom data fetch...' },
    realtime: { status: 'testing', message: 'Testing Supabase real-time...' }
  });

  useEffect(() => {
    runTests();
  }, []);

  const updateTest = (testName, status, message, data = null) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status, message, data }
    }));
  };

  const runTests = async () => {
    // Test 1: Supabase Connection
    try {
      const { data, error } = await supabase
        .from('restrooms')
        .select('id, name, lat, lon')
        .limit(1);

      if (error) throw error;
      
      updateTest('supabase', 'success', 
        `✅ Supabase connected! Found ${data?.length || 0} restrooms in database.`, 
        data
      );
    } catch (error) {
      updateTest('supabase', 'error', 
        `❌ Supabase connection failed: ${error.message}`
      );
    }

    // Test 2: Google Maps API
    try {
      await initGoogleMaps();
      updateTest('googleMaps', 'success', 
        '✅ Google Maps API loaded successfully!'
      );
    } catch (error) {
      updateTest('googleMaps', 'error', 
        `❌ Google Maps API failed: ${error.message || 'Check your API key'}`
      );
    }

    // Test 3: Combined Restroom Data Fetch
    try {
      // Test with New Orleans coordinates
      const testLat = 29.9511;
      const testLon = -90.0715;
      
      const { data, error } = await supabase
        .from('restrooms')
        .select(`
          *,
          reviews (
            id,
            rating
          )
        `)
        .gte('lat', testLat - 0.1)
        .lte('lat', testLat + 0.1)
        .gte('lon', testLon - 0.1)
        .lte('lon', testLon + 0.1)
        .limit(5);

      if (error) throw error;

      const processedData = data.map(restroom => ({
        ...restroom,
        avg_rating: restroom.reviews.length > 0 
          ? restroom.reviews.reduce((sum, review) => sum + review.rating, 0) / restroom.reviews.length
          : 0,
        review_count: restroom.reviews.length
      }));

      updateTest('restrooms', 'success', 
        `✅ Restroom data fetch successful! Found ${processedData.length} restrooms near New Orleans.`,
        processedData
      );
    } catch (error) {
      updateTest('restrooms', 'error',
        `❌ Restroom data fetch failed: ${error.message}`
      );
    }

    // Test 4: Supabase Real-time
    try {
      const subscription = supabase
        .channel('test-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'restrooms'
          },
          (payload) => {
            console.log('Real-time test received:', payload);
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
          if (status === 'SUBSCRIBED') {
            updateTest('realtime', 'success',
              '✅ Supabase real-time is working! You can receive live updates.'
            );
          } else if (status === 'CHANNEL_ERROR') {
            updateTest('realtime', 'error',
              '❌ Supabase real-time failed. Check if real-time is enabled in your Supabase project.'
            );
          }
        });

      // Clean up subscription after 5 seconds
      setTimeout(() => {
        subscription.unsubscribe();
      }, 5000);
    } catch (error) {
      updateTest('realtime', 'error',
        `❌ Real-time setup failed: ${error.message}`
      );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'testing': return 'testing';
      case 'success': return 'success';
      case 'error': return 'error';
      default: return '';
    }
  };

  return (
    <div className="connection-test">
      <h2>🔧 Püper Connection Test</h2>
      <p>Testing your frontend-backend connections...</p>
      
      <div className="test-results">
        {Object.entries(tests).map(([testName, test]) => (
          <div key={testName} className={`test-item ${getStatusClass(test.status)}`}>
            <div className="test-header">
              <span className="test-icon">{getStatusIcon(test.status)}</span>
              <h3>{testName.charAt(0).toUpperCase() + testName.slice(1)} Test</h3>
            </div>
            <p className="test-message">{test.message}</p>
            {test.data && (
              <details className="test-data">
                <summary>View Data ({Array.isArray(test.data) ? test.data.length : 1} items)</summary>
                <pre>{JSON.stringify(test.data, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <div className="test-actions">
        <button onClick={runTests} className="retry-button">
          🔄 Run Tests Again
        </button>
      </div>

      <div className="environment-info">
        <h3>Environment Configuration</h3>
        <div className="env-item">
          <strong>Supabase URL:</strong> {process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
        </div>
        <div className="env-item">
          <strong>Supabase Key:</strong> {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
        </div>
        <div className="env-item">
          <strong>Google Maps Key:</strong> {process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing'}
        </div>
        <div className="env-item">
          <strong>Mapbox Token:</strong> {process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
