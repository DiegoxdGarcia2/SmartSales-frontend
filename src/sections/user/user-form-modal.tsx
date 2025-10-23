import type { User, Role } from 'src/types/user';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import api from 'src/utils/api';

// ----------------------------------------------------------------------

type UserFormModalProps = {
  open: boolean;
  onClose: () => void;
  userToEdit: User | null;
  roles: Role[];
};

interface UserFormData {
  username: string;
  email: string;
  password: string;
  password2: string;
  role_id: string;
  first_name?: string;
  last_name?: string;
}

export function UserFormModal({ open, onClose, userToEdit, roles }: UserFormModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    password2: '',
    role_id: '',
    first_name: '',
    last_name: '',
  });

  // Cargar datos del usuario si es edición
  useEffect(() => {
    if (userToEdit) {
      console.log('📝 Cargando datos para edición:', userToEdit);
      setFormData({
        username: userToEdit.username,
        email: userToEdit.email,
        password: '', // No mostrar contraseña en edición
        password2: '',
        role_id: userToEdit.role.id.toString(),
        first_name: userToEdit.first_name || '',
        last_name: userToEdit.last_name || '',
      });
    } else {
      // Limpiar el formulario si es nuevo usuario
      console.log('➕ Preparando formulario para nuevo usuario');
      setFormData({
        username: '',
        email: '',
        password: '',
        password2: '',
        role_id: '2', // Por defecto CLIENTE
        first_name: '',
        last_name: '',
      });
    }
    setError(null);
  }, [userToEdit, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event: any) => {
    setFormData((prev) => ({ ...prev, role_id: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (userToEdit) {
        // EDITAR: Actualizar usuario existente
        console.log(`📝 Actualizando usuario ID: ${userToEdit.id}`);

        // Preparar datos - NO incluir password si está vacío
        const userData: any = {
          username: formData.username,
          email: formData.email,
          role_id: parseInt(formData.role_id, 10),
          first_name: formData.first_name || '',
          last_name: formData.last_name || '',
        };

        // Solo incluir password si el usuario lo cambió
        if (formData.password && formData.password.trim() !== '') {
          if (formData.password !== formData.password2) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
          }
          userData.password = formData.password;
          userData.password2 = formData.password2;
        }

        console.log('📦 Datos a enviar (PUT):', userData);
        const response = await api.put(`/users/${userToEdit.id}/`, userData);
        console.log('✅ Usuario actualizado:', response.data);
      } else {
        // CREAR: Nuevo usuario
        console.log('➕ Creando nuevo usuario');

        // Validar contraseñas
        if (formData.password !== formData.password2) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          role_id: parseInt(formData.role_id, 10),
          first_name: formData.first_name || '',
          last_name: formData.last_name || '',
        };

        console.log('📦 Datos a enviar (POST):', userData);
        const response = await api.post('/users/register/', userData);
        console.log('✅ Usuario creado:', response.data);
      }

      onClose(); // Cerrar el modal y refrescar la lista
    } catch (err: any) {
      console.error('❌ Error al guardar usuario:', err);
      console.error('Detalles del error:', err.response?.data);

      // Manejo mejorado de errores
      let errorMessage = 'Error al guardar el usuario';

      if (err.response?.data) {
        // Si es un objeto con errores de campo específicos
        if (typeof err.response.data === 'object' && !err.response.data.detail) {
          const fieldErrors = Object.entries(err.response.data)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('; ');
          errorMessage = fieldErrors || errorMessage;
        } else {
          // Si es un mensaje directo
          errorMessage = err.response.data.detail || err.response.data.message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="user-form-modal-title"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          width: 600,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Typography id="user-form-modal-title" variant="h4" sx={{ mb: 3 }}>
          {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre de usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Nombre"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Apellido"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel id="role-label">Rol</InputLabel>
            <Select
              labelId="role-label"
              id="role_id"
              value={formData.role_id}
              label="Rol"
              onChange={handleRoleChange}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Mostrar campos de contraseña solo al crear O si el usuario quiere cambiarla */}
          {!userToEdit && (
            <>
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Confirmar contraseña"
                name="password2"
                type="password"
                value={formData.password2}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />
            </>
          )}

          {userToEdit && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Deja las contraseñas vacías si no deseas cambiarlas
              </Typography>
              <TextField
                fullWidth
                label="Nueva contraseña (opcional)"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Confirmar nueva contraseña"
                name="password2"
                type="password"
                value={formData.password2}
                onChange={handleChange}
                sx={{ mb: 3 }}
              />
            </>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : userToEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
