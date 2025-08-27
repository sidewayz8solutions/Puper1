import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AboutPage from './pages/AboutPage';
import ConnectionTest from './components/Debug/ConnectionTest';
import GeospatialTest from './components/Debug/GeospatialTest';
import AuthCallback from './components/Auth/AuthCallback';
import './App.css';

const queryClient = new QueryClient();

function App() {
  // Global initMap function for Google Maps API callback (from demo integration)
  window.initMap = () => {
    console.log("Google Maps API has loaded.");
  };
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="App">
              {/* Psychedelic background animations */}
              <div className="psychedelic-bg"></div>

              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/profile/:id?" element={<ProfilePage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/test" element={<ConnectionTest />} />
                  <Route path="/geospatial" element={<GeospatialTest />} />
                </Routes>
              </main>
              <Footer />
              <Toaster position="bottom-right" />
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
