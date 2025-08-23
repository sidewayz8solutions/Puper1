import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AboutPage from './pages/AboutPage';
import ConnectionTest from './components/Debug/ConnectionTest';
import GeospatialTest from './components/Debug/GeospatialTest';
import DemoPage from './pages/DemoPage';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="App">
              {/* Psychedelic background animations */}
              <div className="psychedelic-bg"></div>

              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/profile/:id?" element={<ProfilePage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/test" element={<ConnectionTest />} />
                  <Route path="/geospatial" element={<GeospatialTest />} />
                  <Route path="/demo" element={<DemoPage />} />
                </Routes>
              </Layout>
              <Toaster position="bottom-right" />
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
