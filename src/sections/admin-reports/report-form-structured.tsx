import type { Brand } from 'src/types/brand';
import type { Category } from 'src/types/category';
import type { ReportOptions, ReportRequestStructured } from 'src/types/report';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import { useProducts } from 'src/contexts/ProductContext';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ReportFormStructuredProps {
  loading: boolean;
  onSubmit: (request: ReportRequestStructured) => void;
}

export function ReportFormStructured({ loading, onSubmit }: ReportFormStructuredProps) {
  // Usar ProductContext para evitar peticiones duplicadas
  const { categories, brands, fetchCategories, fetchBrands } = useProducts();

  // Estados del formulario
  const [module, setModule] = useState<ReportOptions['module']>('ventas');
  const [format, setFormat] = useState<ReportOptions['format']>('excel');
  const [groupBy, setGroupBy] = useState<ReportOptions['group_by']>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [productName, setProductName] = useState('');

  // Estado de carga (basado en si ya hay datos en el contexto)
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Cargar categorías y marcas SOLO SI NO ESTÁN EN EL CONTEXTO
  useEffect(() => {
    const loadFilters = async () => {
      // Si ya hay datos en el contexto, no hacer peticiones
      if (categories.length > 0 && brands.length > 0) {
        console.log('✅ Usando datos del contexto (sin peticiones HTTP)');
        return;
      }

      // Si no hay datos, cargarlos
      try {
        setLoadingFilters(true);
        console.log('📥 Cargando filtros desde backend...');
        await Promise.all([fetchCategories(), fetchBrands()]);
        console.log('✅ Filtros cargados desde backend');
      } catch (err) {
        console.error('❌ Error al cargar filtros:', err);
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilters();
  }, [categories.length, brands.length, fetchCategories, fetchBrands]);

  const handleSubmit = () => {
    const options: ReportOptions = {
      module,
      format,
      group_by: groupBy,
      filters: {},
    };

    // Agregar filtros solo si están definidos
    if (selectedBrand) {
      options.filters!.brand_name = selectedBrand.name;
    }
    if (selectedCategory) {
      options.filters!.category_name = selectedCategory.name;
    }
    if (productName.trim()) {
      options.filters!.product_name = productName.trim();
    }

    // Agregar fechas si están definidas
    if (startDate) {
      options.start_date = new Date(startDate).toISOString();
    }
    if (endDate) {
      // Ajustar al final del día
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      options.end_date = endDateTime.toISOString();
    }

    // Limpiar filtros vacíos
    if (Object.keys(options.filters!).length === 0) {
      delete options.filters;
    }

    onSubmit({ options });
  };

  // Opciones de agrupación según el módulo
  const getGroupByOptions = () => {
    const options: Array<{ value: ReportOptions['group_by']; label: string }> = [
      { value: null, label: 'Sin agrupar (Detallado)' },
    ];

    if (module === 'ventas') {
      options.push(
        { value: 'mes', label: 'Por Mes' },
        { value: 'category', label: 'Por Categoría' }, // ✅ category (inglés)
        { value: 'brand', label: 'Por Marca' },        // ✅ brand (inglés)
        { value: 'product', label: 'Por Producto' },   // ✅ product (inglés)
        { value: 'user', label: 'Por Cliente' }        // ✅ user (inglés)
      );
    } else if (module === 'productos') {
      options.push(
        { value: 'brand', label: 'Por Marca' },        // ✅ brand (inglés)
        { value: 'category', label: 'Por Categoría' }  // ✅ category (inglés)
      );
    } else if (module === 'reseñas') {
      options.push(
        { value: 'product', label: 'Por Producto' },   // ✅ product (inglés)
        { value: 'user', label: 'Por Usuario' }        // ✅ user (inglés)
      );
    }

    return options;
  };

  // Filtros disponibles según el módulo
  const showBrandFilter = module === 'ventas' || module === 'productos';
  const showCategoryFilter = module === 'ventas' || module === 'productos';
  const showProductFilter = module === 'ventas' || module === 'productos' || module === 'reseñas';

  return (
    <CardContent>
      <Stack spacing={3} sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Módulo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>1. Módulo</InputLabel>
              <Select
                value={module}
                label="1. Módulo"
                onChange={(e) => setModule(e.target.value as any)}
                disabled={loading}
              >
                <MenuItem value="ventas">📊 Ventas</MenuItem>
                <MenuItem value="productos">📦 Productos</MenuItem>
                <MenuItem value="clientes">👥 Clientes</MenuItem>
                <MenuItem value="reseñas">⭐ Reseñas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Formato */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>2. Formato</InputLabel>
              <Select
                value={format}
                label="2. Formato"
                onChange={(e) => setFormat(e.target.value as any)}
                disabled={loading}
              >
                <MenuItem value="excel">📊 Excel (.xlsx)</MenuItem>
                <MenuItem value="json">🖥️ JSON</MenuItem>
                <MenuItem value="pdf">📄 PDF</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Fecha Inicio */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="3. Fecha Inicio (Opcional)"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              helperText="Dejar vacío para incluir desde el inicio"
            />
          </Grid>

          {/* Fecha Fin */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="4. Fecha Fin (Opcional)"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              helperText="Dejar vacío para incluir hasta hoy"
            />
          </Grid>

          {/* Agrupación */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>5. Agrupar Por</InputLabel>
              <Select
                value={groupBy || ''}
                label="5. Agrupar Por"
                onChange={(e) => setGroupBy((e.target.value as any) || null)}
                disabled={loading}
              >
                {getGroupByOptions().map((option) => (
                  <MenuItem key={option.value || 'none'} value={option.value || ''}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtros Opcionales - Categoría */}
          {showCategoryFilter && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                value={selectedCategory}
                onChange={(e, newValue) => setSelectedCategory(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Filtrar por Categoría (Opcional)" />
                )}
                disabled={loading || loadingFilters}
              />
            </Grid>
          )}

          {/* Filtros Opcionales - Marca */}
          {showBrandFilter && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={brands}
                getOptionLabel={(option) => option.name}
                value={selectedBrand}
                onChange={(e, newValue) => setSelectedBrand(newValue)}
                renderInput={(params) => <TextField {...params} label="Filtrar por Marca (Opcional)" />}
                disabled={loading || loadingFilters}
              />
            </Grid>
          )}

          {/* Filtros Opcionales - Producto */}
          {showProductFilter && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Filtrar por Producto (Opcional)"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={loading}
                placeholder="Nombre del producto"
              />
            </Grid>
          )}
        </Grid>

        {/* Botón Submit */}
        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:pen-bold" />
            }
            fullWidth
          >
            {loading ? 'Generando reporte...' : 'Generar Reporte'}
          </Button>
        </Box>
      </Stack>
    </CardContent>
  );
}
