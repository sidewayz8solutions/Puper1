import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  useEffect(() => {
    // The AuthContext will automatically handle the session from the URL
    // and update the user state. Once that's done, redirect to map.
    const timer = setTimeout(() => {
      if (!loading) {
        navigate('/map', { replace: true });
      }
    }, 2000); // Give some time for auth to process

    return () => clearTimeout(timer);
  }, [loading, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: 'var(--marble-background)'
    }}>
      <Loading />
      <p style={{ 
        marginTop: '1rem', 
        color: 'var(--cream)',
        fontFamily: 'Bebas Neue, cursive',
        fontSize: '1.5rem'
      }}>
        Completing sign in...
      </p>
    </div>
  );
};

export default AuthCallback;
