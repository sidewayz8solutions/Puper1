import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  useEffect(() => {
    const run = async () => {
      console.log('🔄 AuthCallback: Processing OAuth callback...');
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          console.error('❌ OAuth error in callback:', error);
          toast.error(`Authentication failed: ${error}`);
          navigate('/', { replace: true });
          return;
        }

        if (code) {
          console.log('🔑 Found auth code, exchanging for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('❌ exchangeCodeForSession error:', exchangeError);
            toast.error('Failed to complete sign-in');
          } else {
            console.log('✅ PKCE session established:', {
              userId: data?.session?.user?.id,
              email: data?.session?.user?.email
            });
          }
        } else {
          console.log('ℹ️ No auth code found in callback URL');
        }
      } catch (e) {
        console.error('❌ Auth callback processing failed:', e);
        toast.error('Authentication failed');
      } finally {
        // Clean up URL and redirect
        console.log('🔄 Redirecting to map...');
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
