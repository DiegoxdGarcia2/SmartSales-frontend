import type { Brand } from 'src/types/brand';
import type { Product } from 'src/types/product';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
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
  onSave: () => Promise<void>;
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

export function ProductFormModal({ open, onClose, onSave, productToEdit, brands }: ProductFormModalProps) {
  const { categories, fetchCategories } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    // Refrescar categorías cuando se abre el modal
    if (open) {
      fetchCategories();
    }
    
    if (productToEdit) {
      console.log('✏️ Editando producto:', productToEdit.id);
      
      // Extraer brand_id: puede venir como número o como objeto {id, name}
      const brandId = typeof productToEdit.brand === 'object' 
        ? productToEdit.brand.id 
        : productToEdit.brand;
      
      // category siempre es número según el tipo
      const categoryId = productToEdit.category;
      
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || '',
        price: productToEdit.price,
        stock: productToEdit.stock.toString(),
        category: categoryId.toString(),
        brand: brandId.toString(),
      });
    } else {
      // Limpiar el formulario si es nuevo producto
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productToEdit, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (event: any) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleBrandChange = (event: any) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, brand: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar que category y brand no estén vacíos
      if (!formData.category || !formData.brand) {
        setError('Debes seleccionar una categoría y una marca');
        setLoading(false);
        return;
      }

      // Parsear a números - asegurar que NO sea un array
      const categoryId = parseInt(formData.category, 10);
      const brandId = parseInt(formData.brand, 10);

      // Validar que sean números válidos
      if (isNaN(categoryId) || isNaN(brandId)) {
        setError('IDs de categoría o marca inválidos');
        setLoading(false);
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: parseInt(formData.stock, 10),
        category: categoryId,
        category_id: categoryId,
        brand: brandId,
        brand_id: brandId,
      };

      if (productToEdit) {
        // Actualizar producto existente
        const response = await api.put(`/products/${productToEdit.id}/`, productData);
        console.log('✅ Producto actualizado:', response.data);
        setSuccessMessage('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        const response = await api.post('/products/', productData);
        console.log('✅ Producto creado:', response.data);
        setSuccessMessage('Producto creado exitosamente');
      }

      // CRÍTICO: Llamar onSave para refrescar la lista ANTES de cerrar
      await onSave();
      onClose(); // Cerrar el modal después de refrescar
    } catch (err: any) {
      console.error('❌ Error al guardar producto:', err);
      
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
              {categories.length === 0 ? (
                <MenuItem disabled value="">
                  No hay categorías disponibles
                </MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))
              )}
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
              {brands.length === 0 ? (
                <MenuItem disabled value="">
                  No hay marcas disponibles
                </MenuItem>
              ) : (
                brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </MenuItem>
                ))
              )}
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

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
        />
      </Box>
    </Modal>
  );
}
