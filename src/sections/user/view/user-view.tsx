import type { User, Role } from 'src/types/user';

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

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { UserFormModal } from '../user-form-modal';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Cargar usuarios y roles desde la API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lista de endpoints a intentar
      const endpoints = ['/users/', '/users/profiles/', '/api/users/'];
      let usersData: User[] = [];
      let success = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Intentando cargar usuarios desde: ${endpoint}`);
          const response = await api.get(endpoint);
          console.log(`✅ Respuesta de ${endpoint}:`, response.data);
          console.log('📊 Tipo de respuesta:', typeof response.data);
          
          if (response.data) {
            console.log('📊 Keys disponibles:', Object.keys(response.data));
          }
          
          // Verificar diferentes formatos de respuesta del backend
          if (Array.isArray(response.data)) {
            // Formato: [user1, user2, ...]
            usersData = response.data;
            success = true;
            console.log(`✅ ${usersData.length} usuarios encontrados en ${endpoint}`);
            break;
          } else if (response.data && Array.isArray(response.data.results)) {
            // Formato paginado: { results: [user1, user2, ...], count: X }
            usersData = response.data.results;
            success = true;
            console.log(`✅ ${usersData.length} usuarios encontrados en ${endpoint} (paginado)`);
            break;
          } else if (response.data && Array.isArray(response.data.users)) {
            // Formato con clave 'users': { users: [user1, user2, ...] }
            usersData = response.data.users;
            success = true;
            console.log(`✅ ${usersData.length} usuarios encontrados en ${endpoint}`);
            break;
          }
        } catch (endpointError: any) {
          console.log(`⚠️ Endpoint ${endpoint} falló:`, endpointError.response?.status);
          continue;
        }
      }
      
      if (!success) {
        console.error('❌ Ningún endpoint devolvió usuarios válidos');
        console.error('💡 Verifica que existan usuarios en la base de datos');
        console.error('💡 O que el endpoint correcto esté configurado en el backend');
      }
      
      setUsers(usersData);
    } catch (err: any) {
      console.error('❌ Error al cargar usuarios:', err);
      console.error('Detalles del error:', err.response?.data);
      setUsers([]); // Asegurar que users siempre sea un array
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Error al cargar usuarios'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await api.get('/users/roles/');
      console.log('✅ Roles cargados:', response.data);
      setRoles(response.data);
    } catch (err: any) {
      console.error('❌ Error al cargar roles:', err);
      console.error('Detalles del error:', err.response?.data);
      // No mostramos error aquí, solo en consola
    }
  }, []);

  // Función para refrescar la lista de usuarios
  const refreshUsers = useCallback(async () => {
    console.log('🔄 Refrescando lista de usuarios...');
    await fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Función para eliminar un usuario
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando usuario ID:', userId);
      await api.delete(`/users/${userId}/`);
      console.log('✅ Usuario eliminado exitosamente');
      // Actualizar la lista local eliminando el usuario
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err: any) {
      console.error('❌ Error al eliminar usuario:', err);
      console.error('Detalles del error:', err.response?.data);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Error al eliminar usuario'
      );
    }
  };

  // Función para abrir modal de edición
  const handleEditUser = (user: User) => {
    console.log('✏️ Editando usuario:', user);
    setUserToEdit(user);
    setOpenModal(true);
  };

  // Función para abrir modal de creación
  const handleNewUser = () => {
    console.log('➕ Creando nuevo usuario');
    setUserToEdit(null);
    setOpenModal(true);
  };

  // Función para cerrar modal y refrescar lista
  const handleCloseModal = () => {
    console.log('🚪 Cerrando modal');
    setOpenModal(false);
    setUserToEdit(null);
    refreshUsers(); // Refrescar la lista de usuarios
  };

  // Adaptar usuarios a la estructura esperada por la tabla
  const adaptedUsers = Array.isArray(users) ? users.map((user) => ({
    id: user.id.toString(),
    name: user.username,
    email: user.email,
    role: typeof user.role === 'object' ? user.role.name : user.role || 'Sin rol',
    company: user.email.split('@')[1] || 'N/A',
    status: 'active',
    isVerified: true,
    avatarUrl: `/assets/images/avatar/avatar-${(user.id % 24) + 1}.webp`,
  })) : [];

  const dataFiltered = applyFilter({
    inputData: adaptedUsers,
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
          Usuarios
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleNewUser}
        >
          Nuevo usuario
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
          <UserTableToolbar
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
                <UserTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={users.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      users.map((user) => user.id.toString())
                    )
                  }
                  headLabel={[
                    { id: 'name', label: 'Nombre de usuario' },
                    { id: 'email', label: 'Email' },
                    { id: 'role', label: 'Rol' },
                    { id: 'company', label: 'Dominio' },
                    { id: 'status', label: 'Estado' },
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
                      const originalUser = users.find((u) => u.id.toString() === row.id);
                      return (
                        <UserTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteUser={() => handleDeleteUser(Number(row.id))}
                          onEditUser={() => originalUser && handleEditUser(originalUser)}
                        />
                      );
                    })}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, users.length)}
                  />

                  {notFound && <TableNoData searchQuery={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            component="div"
            page={table.page}
            count={users.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      )}

      <UserFormModal
        open={openModal}
        onClose={handleCloseModal}
        userToEdit={userToEdit}
        roles={roles}
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
