import type { Product } from 'src/types/product';

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

import { useProducts } from 'src/contexts/ProductContext';

// ----------------------------------------------------------------------

type ProductFormModalProps = {
  open: boolean;
  onClose: () => void;
  productToEdit: Product | null;
};

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  marca: string;
  garantia: string;
}

export function ProductFormModal({ open, onClose, productToEdit }: ProductFormModalProps) {
  const { categories } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    marca: '',
    garantia: '',
  });

  // Cargar datos del producto si es edición
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || '',
        price: productToEdit.price,
        stock: productToEdit.stock.toString(),
        category: productToEdit.category.toString(),
        marca: productToEdit.marca,
        garantia: productToEdit.garantia,
      });
    } else {
      // Limpiar el formulario si es nuevo producto
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        marca: '',
        garantia: '',
      });
    }
    setError(null);
  }, [productToEdit, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (event: any) => {
    setFormData((prev) => ({ ...prev, category: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: parseInt(formData.stock, 10),
        category: parseInt(formData.category, 10),
        marca: formData.marca,
        garantia: formData.garantia,
      };

      if (productToEdit) {
        // Actualizar producto existente
        await api.put(`/products/${productToEdit.id}/`, productData);
      } else {
        // Crear nuevo producto
        await api.post('/products/', productData);
      }

      onClose(); // Cerrar el modal y refrescar la lista
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      setError(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="product-form-modal-title"
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
        <Typography id="product-form-modal-title" variant="h4" sx={{ mb: 3 }}>
          {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Precio"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            inputProps={{ step: '0.01', min: '0' }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            required
            inputProps={{ min: '0' }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel id="category-label">Categoría</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={formData.category}
              label="Categoría"
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Garantía"
            name="garantia"
            value={formData.garantia}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : productToEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
