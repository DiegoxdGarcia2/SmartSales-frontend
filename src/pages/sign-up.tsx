import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { SignUpView } from 'src/sections/auth';

import { useAuth } from 'src/auth/AuthContext';

// ----------------------------------------------------------------------

export default function Page() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <>
      <title>{`Sign up - ${CONFIG.appName}`}</title>

      <SignUpView />
    </>
  );
}