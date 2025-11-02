import type { Brand } from 'src/types/brand';
import type { Category } from 'src/types/category';
import type { ReportOptions } from 'src/types/report';

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
  onSubmit: (options: ReportOptions) => void;
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
  const [dateRange, setDateRange] = useState<string>('custom'); // Nuevo: rango predefinido

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

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

  // Función para calcular fechas según el rango predefinido
  const calculateDateRange = (range: string): { start: string; end: string } | null => {
    const today = new Date();
    const end = today.toISOString().split('T')[0]; // Hoy en formato YYYY-MM-DD
    
    switch (range) {
      case 'last_15_days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 15);
        return { start: start.toISOString().split('T')[0], end };
      }
      case 'last_30_days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 30);
        return { start: start.toISOString().split('T')[0], end };
      }
      case 'last_3_months': {
        const start = new Date(today);
        start.setMonth(start.getMonth() - 3);
        return { start: start.toISOString().split('T')[0], end };
      }
      case 'last_6_months': {
        const start = new Date(today);
        start.setMonth(start.getMonth() - 6);
        return { start: start.toISOString().split('T')[0], end };
      }
      case 'last_year': {
        const start = new Date(today);
        start.setFullYear(start.getFullYear() - 1);
        return { start: start.toISOString().split('T')[0], end };
      }
      case 'last_2_years': {
        const start = new Date(today);
        start.setFullYear(start.getFullYear() - 2);
        return { start: start.toISOString().split('T')[0], end };
      }
      default:
        return null; // Custom: usar fechas manuales
    }
  };

  const handleSubmit = () => {
    // ✅ CONSTRUIR OBJETO OPTIONS (no prompt)
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

    // Agregar fechas según el rango seleccionado
    if (dateRange !== 'custom') {
      // Usar rango predefinido
      const range = calculateDateRange(dateRange);
      if (range) {
        options.start_date = range.start;
        options.end_date = range.end;
      }
    } else {
      // Usar fechas manuales (custom)
      if (startDate) {
        options.start_date = startDate;
      }
      if (endDate) {
        options.end_date = endDate;
      }
    }

    // Limpiar filtros vacíos
    if (Object.keys(options.filters!).length === 0) {
      delete options.filters;
    }

    console.log('🔧 Options enviadas al backend:', options);

    // ✅ Enviar objeto options (NO prompt)
    onSubmit(options);
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
      <Stack spacing={2} sx={{ p: 1.5 }}>
        <Grid container spacing={2}>
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
                <MenuItem value="csv">📄 CSV (.csv)</MenuItem>
                <MenuItem value="json">🖥️ JSON</MenuItem>
                <MenuItem value="pdf">📄 PDF</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Rango de Fechas Predefinido */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>3. Rango de Fechas</InputLabel>
              <Select
                value={dateRange}
                label="3. Rango de Fechas"
                onChange={(e) => setDateRange(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="custom">📅 Personalizado</MenuItem>
                <MenuItem value="last_15_days">📆 Últimos 15 días</MenuItem>
                <MenuItem value="last_30_days">📆 Últimos 30 días</MenuItem>
                <MenuItem value="last_3_months">📊 Últimos 3 meses</MenuItem>
                <MenuItem value="last_6_months">📊 Últimos 6 meses</MenuItem>
                <MenuItem value="last_year">📈 Último año</MenuItem>
                <MenuItem value="last_2_years">📈 Últimos 2 años</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Fecha Inicio - Solo si es "custom" */}
          {dateRange === 'custom' && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Fecha Inicio (Opcional)"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                helperText="Dejar vacío para incluir desde el inicio"
              />
            </Grid>
          )}

          {/* Fecha Fin - Solo si es "custom" */}
          {dateRange === 'custom' && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Fecha Fin (Opcional)"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                helperText="Dejar vacío para incluir hasta hoy"
              />
            </Grid>
          )}

          {/* Agrupación */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>4. Agrupar Por</InputLabel>
              <Select
                value={groupBy || ''}
                label="4. Agrupar Por"
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
