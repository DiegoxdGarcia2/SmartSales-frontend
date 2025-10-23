import type { Brand } from 'src/types/brand';
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
  brands: Brand[];
};

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  brand: string; // Cambio: de marca a brand (ID)
}

export function ProductFormModal({ open, onClose, productToEdit, brands }: ProductFormModalProps) {
  const { categories } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    brand: '', // Cambio: de marca a brand
  });

  // Cargar datos del producto si es edición
  useEffect(() => {
    if (productToEdit) {
      console.log('📝 Cargando datos para edición:', productToEdit);
      
      // Extraer brand_id: puede venir como número o como objeto {id, name}
      const brandId = typeof productToEdit.brand === 'object' 
        ? productToEdit.brand.id 
        : productToEdit.brand;
      
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || '',
        price: productToEdit.price,
        stock: productToEdit.stock.toString(),
        category: productToEdit.category.toString(),
        brand: brandId.toString(),
      });
    } else {
      // Limpiar el formulario si es nuevo producto
      console.log('➕ Preparando formulario para nuevo producto');
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
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

  const handleBrandChange = (event: any) => {
    setFormData((prev) => ({ ...prev, brand: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price, // Enviar como string
        stock: parseInt(formData.stock, 10),
        category_id: parseInt(formData.category, 10),
        brand_id: parseInt(formData.brand, 10),
      };

      console.log('📦 Datos del producto a enviar:', productData);
      console.log('📦 Tipos de datos:', {
        name: typeof productData.name,
        description: typeof productData.description,
        price: typeof productData.price,
        stock: typeof productData.stock,
        category_id: typeof productData.category_id,
        brand_id: typeof productData.brand_id,
      });

      if (productToEdit) {
        // Actualizar producto existente
        console.log(`📝 Actualizando producto ID: ${productToEdit.id}`);
        const response = await api.put(`/products/${productToEdit.id}/`, productData);
        console.log('✅ Producto actualizado:', response.data);
      } else {
        // Crear nuevo producto
        console.log('➕ Creando nuevo producto');
        const response = await api.post('/products/', productData);
        console.log('✅ Producto creado:', response.data);
      }

      onClose(); // Cerrar el modal y refrescar la lista
    } catch (err: any) {
      console.error('❌ Error al guardar producto:', err);
      console.error('Detalles del error:', err.response?.data);
      console.error('Status del error:', err.response?.status);
      console.error('Headers del error:', err.response?.headers);
      
      // Manejo mejorado de errores
      let errorMessage = 'Error al guardar el producto';
      
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

          <FormControl fullWidth required sx={{ mb: 3 }}>
            <InputLabel id="brand-label">Marca</InputLabel>
            <Select
              labelId="brand-label"
              id="brand"
              value={formData.brand}
              label="Marca"
              onChange={handleBrandChange}
            >
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
