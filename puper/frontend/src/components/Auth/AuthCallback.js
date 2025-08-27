import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import Loading from '../Common/Loading';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  useEffect(() => {
    const run = async () => {
      try {
        // Support PKCE: exchange ?code for a session
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('exchangeCodeForSession error:', error);
          } else {
            console.log('PKCE session established:', data?.session?.user?.id);
          }
        }
      } catch (e) {
        console.error('Auth callback processing failed:', e);
      } finally {
        // Clean up URL and go to map; AuthContext will finish loading user
        const cleanUrl = window.location.origin + '/auth/callback';
        window.history.replaceState({}, '', cleanUrl);
        navigate('/map', { replace: true });
      }
    };
    run();
  }, [navigate]);

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
