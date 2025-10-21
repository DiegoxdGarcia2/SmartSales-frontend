import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/auth/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated()) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/sign-in', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}