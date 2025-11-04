import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import RestroomRankingPage from './pages/RestroomRankingPage';
import SettingsPage from './pages/SettingsPage';
import SignInPage from './pages/SignInPage';
import InstallPrompt from './components/PWA/InstallPrompt';

import ConnectionTest from './components/Debug/ConnectionTest';
import GeospatialTest from './components/Debug/GeospatialTest';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  return (
    <div className="App">
      {/* Clean iOS app - no overlays */}

      {!isMapPage && <Header />}
      <main className={`main-content ${isMapPage ? 'map-fullscreen' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile/:id?" element={<ProfilePage />} />
          <Route path="/ranking" element={<RestroomRankingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/signin" element={<SignInPage />} />

          <Route path="/test" element={<ConnectionTest />} />
          <Route path="/geospatial" element={<GeospatialTest />} />
        </Routes>
      </main>
      {!isMapPage && <Footer />}
      <Toaster position="bottom-right" />
      <InstallPrompt />
    </div>
  );
}

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
            <AppContent />
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
