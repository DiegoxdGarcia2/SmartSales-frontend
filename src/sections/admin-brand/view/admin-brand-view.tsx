import type { Brand } from 'src/types/brand';

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
import BrandFormModal from '../brand-form-modal';
import BrandTableRow from '../admin-brand-table-row';
import BrandTableHead from '../admin-brand-table-head';
import BrandTableToolbar from '../admin-brand-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

export default function AdminBrandView() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando marcas...');
      const response = await api.get('/brands/');
      const data = Array.isArray(response.data) ? response.data : [];
      setBrands(data);
      console.log('✅ Marcas cargadas:', data.length);
    } catch (err: any) {
      console.error('❌ Error al cargar marcas:', err);
      setError(err.response?.data?.detail || 'Error al cargar marcas');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

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

  const handleOpenModal = (brand?: Brand) => {
    setSelectedBrand(brand || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedBrand(null);
    setOpenModal(false);
  };

  const handleSaveBrand = async (brandData: Partial<Brand>) => {
    try {
      if (selectedBrand) {
        console.log('✏️ Actualizando marca:', selectedBrand.id);
        await api.put(`/brands/${selectedBrand.id}/`, brandData);
      } else {
        console.log('➕ Creando nueva marca');
        await api.post('/brands/', brandData);
      }
      await fetchBrands();
      handleCloseModal();
    } catch (err: any) {
      console.error('❌ Error al guardar marca:', err);
      throw err;
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando marca:', id);
      await api.delete(`/brands/${id}/`);
      await fetchBrands();
    } catch (err: any) {
      console.error('❌ Error al eliminar marca:', err);
      alert(err.response?.data?.detail || 'Error al eliminar marca');
    }
  };

  const dataFiltered = applyFilter({
    inputData: brands,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Marcas
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenModal()}
        >
          Nueva Marca
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <BrandTableToolbar
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
                  <BrandTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleSort}
                    headLabel={[
                      { id: 'name', label: 'Nombre' },
                      { id: 'description', label: 'Descripción' },
                      { id: 'warranty_info', label: 'Información de Garantía' },
                      { id: '', label: '' },
                    ]}
                  />
                  <TableBody>
                    {dataFiltered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row: Brand) => (
                        <BrandTableRow
                          key={row.id}
                          id={row.id}
                          name={row.name}
                          description={row.description || ''}
                          warrantyInfo={row.warranty_info || ''}
                          onEdit={() => handleOpenModal(row)}
                          onDelete={() => handleDeleteBrand(row.id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={77}
                      emptyRows={emptyRows(page, rowsPerPage, brands.length)}
                    />

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              page={page}
              component="div"
              count={brands.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      <BrandFormModal
        open={openModal}
        brand={selectedBrand}
        onClose={handleCloseModal}
        onSave={handleSaveBrand}
      />
    </Box>
  );
}
