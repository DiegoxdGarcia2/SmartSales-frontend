import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
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
    role: 2, // 2 = CLIENTE por defecto
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

  const handleRoleChange = useCallback((event: any) => {
    setFormData(prev => ({
      ...prev,
      role: event.target.value,
    }));
  }, []);

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
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.password2,
        formData.role
      );
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error en el registro');
      }
    } catch (err) {
      setError('Error de conexión. Verifique que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
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
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
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
        sx={{ mb: 3 }}
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
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="role-label">Tipo de usuario</InputLabel>
        <Select
          labelId="role-label"
          value={formData.role}
          label="Tipo de usuario"
          onChange={handleRoleChange}
          disabled={loading}
        >
          <MenuItem value={2}>Cliente</MenuItem>
          <MenuItem value={1}>Administrador</MenuItem>
        </Select>
      </FormControl>

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
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
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
                <IconButton onClick={() => setShowPassword2(!showPassword2)} edge="end">
                  <Iconify icon={showPassword2 ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
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
        }}
      >
        <Typography variant="h5">Crear Cuenta</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          ¿Ya tienes una cuenta?
          <Link 
            variant="subtitle2" 
            sx={{ ml: 0.5, cursor: 'pointer' }}
            onClick={() => router.push('/sign-in')}
          >
            Iniciar sesión
          </Link>
        </Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          O
        </Typography>
      </Divider>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box>
    </>
  );
}