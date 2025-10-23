import type { RoleExtended } from 'src/types/role';

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
import RoleFormModal from '../role-form-modal';
import TableEmptyRows from '../table-empty-rows';
import RoleTableRow from '../admin-role-table-row';
import RoleTableHead from '../admin-role-table-head';
import RoleTableToolbar from '../admin-role-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

export default function AdminRoleView() {
  const [roles, setRoles] = useState<RoleExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleExtended | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando roles desde /users/roles/');
      
      const response = await api.get('/users/roles/');
      console.log('✅ Respuesta de roles:', response.data);
      
      const rolesData = Array.isArray(response.data) ? response.data : [];
      setRoles(rolesData);
      console.log(`✅ ${rolesData.length} roles cargados`);
    } catch (err: any) {
      console.error('❌ Error al cargar roles:', err);
      console.error('Detalles del error:', err.response?.data);
      setError(err.response?.data?.detail || 'Error al cargar roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

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

  const handleOpenModal = (role?: RoleExtended) => {
    setSelectedRole(role || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
    setOpenModal(false);
  };

  const handleSaveRole = async (roleData: Partial<RoleExtended>) => {
    try {
      if (selectedRole) {
        console.log('✏️ Actualizando rol:', selectedRole.id);
        console.log('📦 Datos a enviar (PUT):', roleData);
        await api.put(`/users/roles/${selectedRole.id}/`, roleData);
      } else {
        console.log('➕ Creando nuevo rol');
        console.log('📦 Datos a enviar (POST):', roleData);
        const response = await api.post('/users/roles/', roleData);
        console.log('✅ Rol creado:', response.data);
      }
      await fetchRoles();
      handleCloseModal();
    } catch (err: any) {
      console.error('❌ Error al guardar rol:', err);
      console.error('📋 Detalle del error:', err.response?.data);
      throw err;
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando rol:', id);
      await api.delete(`/users/roles/${id}/`);
      await fetchRoles();
    } catch (err: any) {
      console.error('❌ Error al eliminar rol:', err);
      alert(err.response?.data?.detail || 'Error al eliminar rol');
    }
  };

  const dataFiltered = applyFilter({
    inputData: roles,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Roles
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenModal()}
        >
          Nuevo Rol
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <RoleTableToolbar
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
                  <RoleTableHead
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
                      .map((row: RoleExtended) => (
                        <RoleTableRow
                          key={row.id}
                          id={row.id}
                          name={row.name}
                          description={row.description || ''}
                          onEdit={() => handleOpenModal(row)}
                          onDelete={() => handleDeleteRole(row.id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={77}
                      emptyRows={emptyRows(page, rowsPerPage, roles.length)}
                    />

                    {notFound && <TableNoData query={filterName} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <TablePagination
              page={page}
              component="div"
              count={roles.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      <RoleFormModal
        open={openModal}
        role={selectedRole}
        onClose={handleCloseModal}
        onSave={handleSaveRole}
      />
    </Box>
  );
}
