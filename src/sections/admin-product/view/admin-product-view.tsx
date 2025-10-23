import type { Brand } from 'src/types/brand';
import type { Product } from 'src/types/product';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import api from 'src/utils/api';

import { DashboardContent } from 'src/layouts/dashboard';
import { useProducts } from 'src/contexts/ProductContext';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../../user/table-no-data';
import { ProductFormModal } from '../product-form-modal';
import { TableEmptyRows } from '../../user/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { AdminProductTableRow } from '../admin-product-table-row';
import { AdminProductTableHead } from '../admin-product-table-head';
import { AdminProductTableToolbar } from '../admin-product-table-toolbar';

// ----------------------------------------------------------------------

export function AdminProductView() {
  const table = useTable();
  const { categories } = useProducts();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Cargar productos desde la API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products/');
      console.log('✅ Productos cargados:', response.data);
      setProducts(response.data);
    } catch (err: any) {
      console.error('❌ Error al cargar productos:', err);
      console.error('Detalles del error:', err.response?.data);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Error al cargar productos'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar marcas desde la API
  const fetchBrands = useCallback(async () => {
    try {
      const response = await api.get('/brands/');
      console.log('✅ Marcas cargadas:', response.data);
      setBrands(response.data);
    } catch (err: any) {
      console.error('❌ Error al cargar marcas:', err);
      console.error('Detalles del error:', err.response?.data);
      // No mostramos error aquí, solo en consola
    }
  }, []);

  // Función para refrescar la lista de productos
  const refreshProducts = useCallback(async () => {
    console.log('🔄 Refrescando lista de productos...');
    await fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, [fetchProducts, fetchBrands]);

  // Función para eliminar un producto
  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando producto ID:', productId);
      await api.delete(`/products/${productId}/`);
      console.log('✅ Producto eliminado exitosamente');
      // Actualizar la lista local eliminando el producto
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
    } catch (err: any) {
      console.error('❌ Error al eliminar producto:', err);
      console.error('Detalles del error:', err.response?.data);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Error al eliminar producto'
      );
    }
  };

  // Función para abrir modal de edición
  const handleEditProduct = (product: Product) => {
    console.log('✏️ Editando producto:', product);
    setProductToEdit(product);
    setOpenModal(true);
  };

  // Función para abrir modal de creación
  const handleNewProduct = () => {
    console.log('➕ Creando nuevo producto');
    setProductToEdit(null);
    setOpenModal(true);
  };

  // Función para cerrar modal y refrescar lista
  const handleCloseModal = () => {
    console.log('🚪 Cerrando modal');
    setOpenModal(false);
    setProductToEdit(null);
    refreshProducts(); // Refrescar la lista de productos
  };

  // Adaptar productos a la estructura esperada por la tabla
  const adaptedProducts = products.map((product) => {
    const category = categories.find((cat) => cat.id === product.category);
    
    // Extraer brand: puede venir como número o como objeto {id, name}
    const brandId = typeof product.brand === 'object' ? product.brand?.id : product.brand;
    const brand = brands.find((b) => b.id === brandId);
    
    return {
      id: product.id.toString(),
      name: product.name,
      category: category?.name || 'Sin categoría',
      categoryId: product.category || 0,
      brand: brand?.name || '-',
      brandId: brandId || 0,
      price: product.price,
      stock: product.stock,
    };
  });

  const dataFiltered = applyFilter({
    inputData: adaptedProducts,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Gestión de Productos
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleNewProduct}
        >
          Nuevo producto
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
        <Card>
          <AdminProductTableToolbar
            numSelected={table.selected.length}
            filterName={filterName}
            onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
              setFilterName(event.target.value);
              table.onResetPage();
            }}
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <AdminProductTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={products.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked: boolean) =>
                    table.onSelectAllRows(
                      checked,
                      products.map((product) => product.id.toString())
                    )
                  }
                  headLabel={[
                    { id: 'name', label: 'Nombre' },
                    { id: 'category', label: 'Categoría' },
                    { id: 'brand', label: 'Marca' },
                    { id: 'price', label: 'Precio' },
                    { id: 'stock', label: 'Stock' },
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => {
                      const originalProduct = products.find((p) => p.id.toString() === row.id);
                      return (
                        <AdminProductTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteProduct={() => handleDeleteProduct(Number(row.id))}
                          onEditProduct={() =>
                            originalProduct && handleEditProduct(originalProduct)
                          }
                        />
                      );
                    })}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, products.length)}
                  />

                  {notFound && <TableNoData searchQuery={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            component="div"
            page={table.page}
            count={products.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}

      <ProductFormModal
        open={openModal}
        onClose={handleCloseModal}
        productToEdit={productToEdit}
        brands={brands}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
