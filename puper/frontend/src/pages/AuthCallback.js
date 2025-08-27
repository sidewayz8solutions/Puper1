import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (session) {
          console.log('Auth successful, redirecting...');
          // Redirect to map or dashboard after successful auth
          navigate('/map');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'var(--marble-background)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Authenticating...</h2>
        <p>Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
