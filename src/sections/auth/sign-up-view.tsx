import { useState, useCallback } from 'react';

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

export function SignUpView() {
  const router = useRouter();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    // role: 2, // SIEMPRE será CLIENTE (2) para registro público
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

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.password2) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    if (formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }

    return true;
  };

  const handleSignUp = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // IMPORTANTE: Siempre registrar como CLIENTE (rol 2) en el registro público
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.password2,
        2 // CLIENTE - Los admins solo se crean desde el panel de administración
      );
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error en el registro');
      }
    } catch {
      setError('Error de conexión. Verifique que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, formData, router]);

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignUp}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
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
        label="Nombre de usuario"
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

      <TextField
        fullWidth
        name="email"
        label="Correo electrónico"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
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

      <TextField
        fullWidth
        name="password"
        label="Contraseña"
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

      <TextField
        fullWidth
        name="password2"
        label="Confirmar contraseña"
        value={formData.password2}
        onChange={handleChange('password2')}
        type={showPassword2 ? 'text' : 'password'}
        disabled={loading}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowPassword2(!showPassword2)} 
                  edge="end"
                  sx={{
                    color: '#764ba2',
                    '&:hover': {
                      color: '#667eea',
                      bgcolor: 'rgba(102, 126, 234, 0.08)',
                    },
                  }}
                >
                  <Iconify icon={showPassword2 ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
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
        disabled={loading}
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
        {loading ? 'Registrando...' : 'Crear cuenta'}
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
          Crear Cuenta
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          ¿Ya tienes una cuenta?
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
            onClick={() => router.push('/sign-in')}
          >
            Iniciar sesión
          </Link>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}