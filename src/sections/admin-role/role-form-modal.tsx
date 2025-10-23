import type { RoleExtended } from 'src/types/role';

import { useState, useEffect } from 'react';

import {
  Box,
  Alert,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface RoleFormModalProps {
  open: boolean;
  role: RoleExtended | null;
  onClose: () => void;
  onSave: (data: Partial<RoleExtended>) => Promise<void>;
}

interface RoleFormData {
  name: string;
  description: string;
}

export default function RoleFormModal({
  open,
  role,
  onClose,
  onSave,
}: RoleFormModalProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
    setError(null);
  }, [role, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataToSend: Partial<RoleExtended> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      await onSave(dataToSend);
    } catch (err: any) {
      console.error('Error al guardar rol:', err);
      setError(err.response?.data?.detail || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {role ? 'Editar Rol' : 'Nuevo Rol'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              name="name"
              label="Nombre"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
              placeholder="Ej: ADMINISTRADOR, CLIENTE, VENDEDOR"
            />

            <TextField
              name="description"
              label="Descripción"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Descripción de los permisos y responsabilidades del rol"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
