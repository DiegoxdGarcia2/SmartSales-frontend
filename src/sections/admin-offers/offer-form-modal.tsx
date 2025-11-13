import type { Product } from 'src/services/inventoryService';
import type { Offer, OfferType, OfferStatus } from 'src/types/offer';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Alert, Typography } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import inventoryService from 'src/services/inventoryService';

// ========================================
// OFFER FORM MODAL - ALINEADO CON BACKEND
// ========================================

interface OfferFormModalProps {
  open: boolean;
  offer: Offer | null;
  onClose: () => void;
  onSave: (offerData: Partial<Offer>) => Promise<void>;
}

const OFFER_TYPES: { value: OfferType; label: string; icon: string }[] = [
  { value: 'FLASH_SALE', label: 'Venta Flash', icon: '🔥' },
  { value: 'DAILY_DEAL', label: 'Oferta del Día', icon: '⭐' },
  { value: 'SEASONAL', label: 'Oferta de Temporada', icon: '🎄' },
  { value: 'CLEARANCE', label: 'Liquidación', icon: '🏷️' },
  { value: 'PERSONALIZED', label: 'Oferta Personalizada', icon: '🎯' },
];

const STATUS_OPTIONS: { value: OfferStatus; label: string; color: 'default' | 'success' | 'warning' }[] = [
  { value: 'DRAFT', label: 'Borrador', color: 'default' },
  { value: 'ACTIVE', label: 'Activa', color: 'success' },
  { value: 'PAUSED', label: 'Pausada', color: 'warning' },
];

export function OfferFormModal({ open, offer, onClose, onSave }: OfferFormModalProps) {
  const [formData, setFormData] = useState<Partial<Offer>>({
    name: '',
    description: '',
    offer_type: 'FLASH_SALE',
    discount_percentage: 20,
    start_date: '',
    end_date: '',
    status: 'DRAFT',
    priority: 5,
    max_uses: null,
    max_uses_per_user: 1,
    min_purchase_amount: 0,
  });

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productsOptions, setProductsOptions] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos al abrir el modal
  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await inventoryService.getProducts({ pageSize: 100 });
      setProductsOptions(products);
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name,
        description: offer.description,
        offer_type: offer.offer_type,
        discount_percentage: offer.discount_percentage,
        start_date: offer.start_date.split('T')[0],
        end_date: offer.end_date.split('T')[0],
        status: offer.status,
        priority: offer.priority,
        max_uses: offer.max_uses,
        max_uses_per_user: offer.max_uses_per_user,
        min_purchase_amount: offer.min_purchase_amount,
      });
      
      // Cargar productos seleccionados si existen
      if (offer.offer_products && offer.offer_products.length > 0) {
        // Extraer IDs, manejando tanto números como objetos expandidos
        const productIds = offer.offer_products.map(op => 
          typeof op.product === 'object' ? op.product.id : op.product
        );
        loadSelectedProducts(productIds);
      } else {
        setSelectedProducts([]);
      }
    } else {
      // Valores por defecto para nueva oferta
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      setFormData({
        name: '',
        description: '',
        offer_type: 'FLASH_SALE',
        discount_percentage: 20,
        start_date: today.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        status: 'DRAFT',
        priority: 5,
        max_uses: null,
        max_uses_per_user: 1,
        min_purchase_amount: 0,
      });
      
      // Reset selected products
      setSelectedProducts([]);
    }
  }, [offer]);

  const loadSelectedProducts = async (productIds: number[]) => {
    try {
      const products = await Promise.all(
        productIds.map(id => inventoryService.getProduct(id))
      );
      setSelectedProducts(products.filter((p): p is Product => p !== null));
    } catch (err) {
      console.error('Error cargando productos seleccionados:', err);
    }
  };

  const handleChange = (field: keyof Offer, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validar campos requeridos
      if (!formData.name || !formData.description || !formData.start_date || !formData.end_date) {
        setError('Por favor completa todos los campos requeridos');
        setLoading(false);
        return;
      }

      // Validar productos seleccionados
      console.log('🔍 Validando productos seleccionados:', selectedProducts);
      
      if (selectedProducts.length === 0) {
        console.error('❌ No hay productos seleccionados');
        setError('Debes seleccionar al menos un producto');
        setLoading(false);
        return;
      }

      // Obtener IDs de productos
      const productIdsArray = selectedProducts.map(p => p.id);
      console.log('🔍 product_ids:', productIdsArray);

      // Limpiar y preparar datos para el backend
      const dataToSend: any = {
        name: formData.name,
        description: formData.description,
        offer_type: formData.offer_type,
        discount_percentage: Number(formData.discount_percentage) || 20,
        start_date: `${formData.start_date}T00:00:00Z`,
        end_date: `${formData.end_date}T23:59:59Z`,
        status: formData.status || 'DRAFT',
        priority: Number(formData.priority) || 5,
        max_uses_per_user: Number(formData.max_uses_per_user) || 1,
        min_purchase_amount: Number(formData.min_purchase_amount) || 0,
      };

      // max_uses puede ser null
      if (formData.max_uses !== null && formData.max_uses !== undefined) {
        dataToSend.max_uses = Number(formData.max_uses);
      }

      // Agregar product_ids (requerido por backend)
      dataToSend.product_ids = productIdsArray;

      console.log('📤 Enviando datos al backend:');
      console.log('   - name:', dataToSend.name);
      console.log('   - product_ids:', dataToSend.product_ids);
      console.log('   - discount_percentage:', dataToSend.discount_percentage);
      console.log('   - status:', dataToSend.status);
      console.log('   Full payload:', JSON.stringify(dataToSend, null, 2));

      await onSave(dataToSend);
      onClose();
    } catch (err: any) {
      console.error('❌ Error al guardar oferta:', err);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || JSON.stringify(err.response?.data)
        || err.message 
        || 'Error al guardar oferta';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{offer ? '✏️ Editar Oferta' : '➕ Nueva Oferta'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Nombre */}
          <TextField
            label="Nombre de la Oferta"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            placeholder="Ej: 🔥 Venta Flash - 50% OFF"
            helperText="Incluye emojis para hacerla más atractiva"
          />

          {/* Descripción */}
          <TextField
            label="Descripción"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Describe los detalles de la oferta..."
          />

          {/* Tipo y Estado */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Oferta</InputLabel>
              <Select
                value={formData.offer_type}
                label="Tipo de Oferta"
                onChange={(e) => handleChange('offer_type', e.target.value as OfferType)}
              >
                {OFFER_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={(e) => handleChange('status', e.target.value as OfferStatus)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Chip label={status.label} color={status.color} size="small" />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Puedes crear en borrador y activar después
              </FormHelperText>
            </FormControl>
          </Box>

          {/* Descuento y Prioridad */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Porcentaje de Descuento: {formData.discount_percentage}%
              </Typography>
              <Slider
                value={formData.discount_percentage}
                onChange={(_, value) => handleChange('discount_percentage', value as number)}
                min={5}
                max={100}
                step={5}
                marks={[
                  { value: 5, label: '5%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            <TextField
              label="Prioridad"
              type="number"
              value={formData.priority ?? 5}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                handleChange('priority', isNaN(value) ? 5 : value);
              }}
              fullWidth
              inputProps={{ min: 0, max: 10 }}
              helperText="≥5 = Featured"
            />
          </Box>

          {/* Fechas */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Fecha de Inicio"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Fecha de Fin"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Selector de Productos (REQUERIDO) */}
          <Autocomplete
            multiple
            options={productsOptions}
            value={selectedProducts}
            onChange={(_, newValue) => setSelectedProducts(newValue)}
            getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loadingProducts}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Productos"
                placeholder="Buscar productos..."
                required
                error={selectedProducts.length === 0}
                helperText={
                  selectedProducts.length === 0
                    ? 'Selecciona al menos un producto (requerido)'
                    : `${selectedProducts.length} producto(s) seleccionado(s)`
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`${option.name} (${option.id})`}
                  size="small"
                />
              ))
            }
          />

          {/* Límites */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="Usos Máximos"
              type="number"
              value={formData.max_uses ?? ''}
              onChange={(e) =>
                handleChange('max_uses', e.target.value === '' ? null : parseInt(e.target.value, 10))
              }
              fullWidth
              inputProps={{ min: 0 }}
              helperText="Vacío = ilimitado"
              placeholder="Ilimitado"
            />

            <TextField
              label="Usos por Usuario"
              type="number"
              value={formData.max_uses_per_user ?? 1}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                handleChange('max_uses_per_user', isNaN(value) ? 1 : value);
              }}
              fullWidth
              required
              inputProps={{ min: 1 }}
              helperText="Mínimo 1"
            />

            <TextField
              label="Compra Mínima ($)"
              type="number"
              value={formData.min_purchase_amount ?? 0}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                handleChange('min_purchase_amount', isNaN(value) ? 0 : value);
              }}
              fullWidth
              inputProps={{ min: 0, step: 10 }}
              helperText="0 = sin mínimo"
            />
          </Box>

          {/* Info de Featured */}
          {formData.priority && formData.priority >= 5 && (
            <Alert severity="info" icon="⭐">
              Esta oferta será <strong>destacada</strong> (prioridad ≥ 5) y aparecerá en la sección
              de ofertas principales.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Guardando...' : offer ? '✅ Actualizar' : '➕ Crear Oferta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
