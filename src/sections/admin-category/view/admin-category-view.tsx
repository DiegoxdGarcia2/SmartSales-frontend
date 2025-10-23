import type { Category } from 'src/types/category';

import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Table,
  Alert,
  Button,
  TableBody,
  Typography,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import api from 'src/utils/api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import TableEmptyRows from '../table-empty-rows';
import CategoryFormModal from '../category-form-modal';
import CategoryTableRow from '../admin-category-table-row';
import CategoryTableHead from '../admin-category-table-head';
import { emptyRows, applyFilter, getComparator } from '../utils';
import CategoryTableToolbar from '../admin-category-table-toolbar';

export default function AdminCategoryView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando categorías...');
      const response = await api.get('/categories/');
      const data = Array.isArray(response.data) ? response.data : [];
      setCategories(data);
      console.log('✅ Categorías cargadas:', data.length);
    } catch (err: any) {
      console.error('❌ Error al cargar categorías:', err);
      setError(err.response?.data?.detail || 'Error al cargar categorías');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleOpenModal = (category?: Category) => {
    setSelectedCategory(category || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setOpenModal(false);
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (selectedCategory) {
        console.log('✏️ Actualizando categoría:', selectedCategory.id);
        await api.put(`/categories/${selectedCategory.id}/`, categoryData);
      } else {
        console.log('➕ Creando nueva categoría');
        await api.post('/categories/', categoryData);
      }
      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      console.error('❌ Error al guardar categoría:', err);
      throw err;
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando categoría:', id);
      await api.delete(`/categories/${id}/`);
      await fetchCategories();
    } catch (err: any) {
      console.error('❌ Error al eliminar categoría:', err);
      alert(err.response?.data?.detail || 'Error al eliminar categoría');
    }
  };

  const dataFiltered = applyFilter({
    inputData: categories,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Categorías
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenModal()}
        >
          Nueva Categoría
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CategoryTableToolbar
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <CategoryTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleSort}
                    headLabel={[
                      { id: 'name', label: 'Nombre' },
                      { id: 'description', label: 'Descripción' },
                      { id: '', label: '' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row: Category) => (
                        <CategoryTableRow
                          key={row.id}
                          id={row.id}
                          name={row.name}
                          description={row.description || ''}
                          onEdit={() => handleOpenModal(row)}
                          onDelete={() => handleDeleteCategory(row.id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={77}
                      emptyRows={emptyRows(page, rowsPerPage, categories.length)}
                    />

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              page={page}
              component="div"
              count={categories.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      <CategoryFormModal
        open={openModal}
        category={selectedCategory}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
      />
    </Box>
  );
}
