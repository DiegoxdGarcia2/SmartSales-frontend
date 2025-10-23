import type { Brand } from 'src/types/brand';

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

interface BrandFormModalProps {
  open: boolean;
  brand: Brand | null;
  onClose: () => void;
  onSave: (data: Partial<Brand>) => Promise<void>;
}

interface BrandFormData {
  name: string;
  description: string;
  warranty_info: string;
}

export default function BrandFormModal({
  open,
  brand,
  onClose,
  onSave,
}: BrandFormModalProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    warranty_info: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description || '',
        warranty_info: brand.warranty_info || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        warranty_info: '',
      });
    }
    setError(null);
  }, [brand, open]);

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
      const dataToSend: Partial<Brand> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        warranty_info: formData.warranty_info.trim() || undefined,
      };

      await onSave(dataToSend);
    } catch (err: any) {
      console.error('Error al guardar marca:', err);
      setError(err.response?.data?.detail || 'Error al guardar la marca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {brand ? 'Editar Marca' : 'Nueva Marca'}
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
            />

            <TextField
              name="description"
              label="Descripción"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              name="warranty_info"
              label="Información de Garantía"
              value={formData.warranty_info}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Ej: 12 meses de garantía contra defectos de fabricación"
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
