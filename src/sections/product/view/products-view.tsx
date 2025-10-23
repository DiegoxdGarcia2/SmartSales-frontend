import type { Product } from 'src/types/product';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useProducts } from 'src/contexts/ProductContext';

import { Iconify } from 'src/components/iconify';

import { ProductItem } from '../product-item';
import { ProductSort } from '../product-sort';
import { CartIcon } from '../product-cart-widget';
import { ProductFilters } from '../product-filters';

import type { FiltersProps } from '../product-filters';

// ----------------------------------------------------------------------

const RATING_OPTIONS = ['up4Star', 'up3Star', 'up2Star', 'up1Star'];

const PRICE_OPTIONS = [
  { value: 'below', label: 'Menos de $500' },
  { value: 'between', label: 'Entre $500 - $2000' },
  { value: 'above', label: 'Más de $2000' },
];

const defaultFilters = {
  price: '',
  rating: RATING_OPTIONS[0],
  category: 'all',
  brand: 'all',
};

export function ProductsView() {
  const { products, categories, brands, loading, error } = useProducts();
  
  const [sortBy, setSortBy] = useState('featured');

  const [openFilter, setOpenFilter] = useState(false);

  const [filters, setFilters] = useState<FiltersProps>(defaultFilters);

  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenFilter = useCallback(() => {
    setOpenFilter(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setOpenFilter(false);
  }, []);

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleSetFilters = useCallback((updateState: Partial<FiltersProps>) => {
    setFilters((prevValue) => ({ ...prevValue, ...updateState }));
  }, []);

  // Función para aplicar filtros y ordenamiento
  const applyFiltersAndSort = useCallback((productList: Product[]) => {
    let filtered = [...productList];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((product) => product.category.toString() === filters.category);
    }

    // Filtrar por marca
    if (filters.brand && filters.brand !== 'all') {
      const brandId = typeof filtered[0]?.brand === 'object' 
        ? filtered[0]?.brand?.id 
        : filtered[0]?.brand;
      
      filtered = filtered.filter((product) => {
        const productBrandId = typeof product.brand === 'object' 
          ? product.brand?.id 
          : product.brand;
        return productBrandId?.toString() === filters.brand;
      });
    }

    // Filtrar por precio
    if (filters.price) {
      filtered = filtered.filter((product) => {
        const precio = Number(product.price);
        if (filters.price === 'below') return precio < 500;
        if (filters.price === 'between') return precio >= 500 && precio <= 2000;
        if (filters.price === 'above') return precio > 2000;
        return true;
      });
    }

    // Filtrar por rating (comentado hasta que se agregue al modelo)
    // if (filters.rating && filters.rating !== 'up4Star') {
    //   const minRating = Number(filters.rating.replace('up', '').replace('Star', ''));
    //   filtered = filtered.filter((product) => 
    //     product.rating ? Number(product.rating) >= minRating : false
    //   );
    // }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'latest':
        // Ordenar por ID (últimos primero) hasta que tengamos created_at
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'priceAsc':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // 'featured' - mantener orden original
        break;
    }

    return filtered;
  }, [filters, sortBy, searchQuery]);

  // Aplicar filtros y ordenamiento con useMemo para optimizar rendimiento
  const filteredAndSortedProducts = useMemo(() => 
    applyFiltersAndSort(products),
    [products, applyFiltersAndSort]
  );

  const canReset = Object.keys(filters).some(
    (key) => filters[key as keyof FiltersProps] !== defaultFilters[key as keyof FiltersProps]
  );

  return (
    <DashboardContent>
      <CartIcon totalItems={8} />

      <Typography variant="h4" sx={{ mb: 5 }}>
        Productos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <TextField
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar productos..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />

        <Box
          sx={{
            gap: 1,
            flexShrink: 0,
            display: 'flex',
          }}
        >
          <ProductFilters
            canReset={canReset}
            filters={filters}
            onSetFilters={handleSetFilters}
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
            onResetFilter={() => {
              setFilters(defaultFilters);
              setSearchQuery('');
            }}
            options={{
              ratings: RATING_OPTIONS,
              price: PRICE_OPTIONS,
              categories: [], // Las categorías se obtienen del contexto
            }}
          />

          <ProductSort
            sortBy={sortBy}
            onSort={handleSort}
            options={[
              { value: 'featured', label: 'Destacados' },
              { value: 'latest', label: 'Más recientes' },
              { value: 'priceDesc', label: 'Precio: Mayor-Menor' },
              { value: 'priceAsc', label: 'Precio: Menor-Mayor' },
              { value: 'nameAsc', label: 'Nombre: A-Z' },
            ]}
          />
        </Box>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredAndSortedProducts.map((product) => {
              // Adaptar el producto de la API al formato esperado por ProductItem
              const adaptedProduct = {
                id: product.id.toString(),
                name: product.name,
                price: parseFloat(product.price),
                status: product.stock > 0 ? 'disponible' : 'agotado',
                coverUrl: '/assets/images/product/product-1.webp', // Imagen por defecto
                colors: ['#00AB55', '#000000'], // Colores por defecto
                priceSale: null,
              };
              
              return (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProductItem product={adaptedProduct} />
                </Grid>
              );
            })}
          </Grid>

          {products.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: 'center',
                py: 10,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No hay productos disponibles
              </Typography>
            </Box>
          )}

          {products.length > 0 && (
            <Pagination count={10} color="primary" sx={{ mt: 8, mx: 'auto' }} />
          )}
        </>
      )}
    </DashboardContent>
  );
}
