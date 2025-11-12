import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/AuthContext';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = useCallback((field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  }, [error]);

  const handleSignIn = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Redirigir a la ubicación anterior o al dashboard
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        router.push(from);
      } else {
        setError(result.error || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión. Verifique que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  }, [login, formData, router, location]);

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignIn}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            mb: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(211, 47, 47, 0.15)',
          }}
        >
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="username"
        label="Email o Usuario"
        placeholder="Ingresa tu email o nombre de usuario"
        value={formData.username}
        onChange={handleChange('username')}
        disabled={loading}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
                borderWidth: '2px',
              },
            },
          },
          '& .MuiInputLabel-root': {
            '&.Mui-focused': {
              color: '#667eea',
            },
          },
        }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Link 
        variant="body2" 
        sx={{ 
          mb: 1.5,
          alignSelf: 'flex-end',
          color: '#764ba2',
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#667eea',
            textDecoration: 'underline',
          },
        }}
      >
        ¿Olvidaste tu contraseña?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Contraseña"
        placeholder="Ingresa tu contraseña"
        value={formData.password}
        onChange={handleChange('password')}
        type={showPassword ? 'text' : 'password'}
        disabled={loading}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowPassword(!showPassword)} 
                  edge="end"
                  sx={{
                    color: '#764ba2',
                    '&:hover': {
                      color: '#667eea',
                      bgcolor: 'rgba(102, 126, 234, 0.08)',
                    },
                  }}
                >
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
                borderWidth: '2px',
              },
            },
          },
          '& .MuiInputLabel-root': {
            '&.Mui-focused': {
              color: '#667eea',
            },
          },
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={loading || !formData.username || !formData.password}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          py: 1.5,
          fontSize: '1rem',
          textTransform: 'none',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&.Mui-disabled': {
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
            color: 'rgba(255, 255, 255, 0.6)',
          },
        }}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: '60px',
            height: '4px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            mb: 2,
          }}
        />
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Bienvenido
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          ¿No tienes una cuenta?
          <Link 
            variant="subtitle2" 
            sx={{ 
              ml: 0.5, 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
            onClick={() => router.push('/sign-up')}
          >
            Regístrate
          </Link>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}
