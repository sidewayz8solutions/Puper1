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
import { SignUpPage, LoginPage } from './pages/AuthPages';
import AuthCallback from './components/Auth/AuthCallback';
import './App.css';

const queryClient = new QueryClient();

function App() {
  // Global initMap function for Google Maps API callback
  window.initMap = () => {
    console.log("Google Maps API has loaded.");
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="App">
              {/* Background effects */}
              <div className="app-background" />
              
              <Header />
              <main className="main-content">
                <Routes>
                  {/* Main Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/profile/:id?" element={<ProfilePage />} />
                  
                  {/* Authentication Pages */}
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                </Routes>
              </main>
              <Footer />
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    borderRadius: '15px',
                    padding: '16px',
                    fontSize: '14px',
                    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
                  },
                  success: {
                    style: {
                      background: 'linear-gradient(135deg, #0dffe7 0%, #00a8a3 100%)',
                      color: '#000',
                    },
                  },
                  error: {
                    style: {
                      background: 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)',
                      color: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;