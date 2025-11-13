import type { Offer } from 'src/types/offer';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Chip,
  Alert,
  Stack,
  Dialog,
  TableRow,
  TableCell,
  TableHead,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import offerService from 'src/services/offerService';

import { Iconify } from 'src/components/iconify';

import { OfferFormModal } from '../offer-form-modal';

// ========================================
// ADMIN OFFERS VIEW
// ========================================

export function AdminOffersView() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ==================== CARGAR OFERTAS ====================

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Cargando ofertas...');
      const response = await offerService.getOffers({
        page: page + 1,
        pageSize: rowsPerPage,
        ordering: '-created_at',
      });

      console.log('📦 Respuesta completa del backend:', response);
      
      // El backend puede devolver directamente un array o un objeto con results
      if (Array.isArray(response)) {
        console.log('✅ Ofertas cargadas (array directo):', response.length, 'ofertas');
        setOffers(response);
        setTotalCount(response.length);
      } else if (response?.results) {
        console.log('✅ Ofertas cargadas (paginado):', response.results.length, 'ofertas');
        console.log('   Total en backend:', response.count);
        setOffers(response.results);
        setTotalCount(response.count);
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', response);
        setOffers([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error('❌ Error cargando ofertas:', err);
      setError(err.message || 'Error al cargar ofertas');
      setOffers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  // ==================== HANDLERS ====================

  const handleOpenModal = (offer?: Offer) => {
    setSelectedOffer(offer || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOffer(null);
  };

  const handleSaveOffer = async (offerData: Partial<Offer>) => {
    try {
      if (selectedOffer) {
        // Actualizar
        const updated = await offerService.updateOffer(selectedOffer.id, offerData);
        console.log('✅ Oferta actualizada:', updated);
        setSuccess('✅ Oferta actualizada exitosamente');
      } else {
        // Crear
        const created = await offerService.createOffer(offerData);
        console.log('✅ Oferta creada:', created);
        setSuccess('✅ Oferta creada exitosamente');
      }
      
      // Recargar lista
      await loadOffers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('❌ Error en handleSaveOffer:', err);
      setError(err.response?.data?.message || err.message || 'Error al guardar oferta');
    }
  };

  const handleOpenDeleteDialog = (offer: Offer) => {
    setOfferToDelete(offer);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setOfferToDelete(null);
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete) return;

    try {
      await offerService.deleteOffer(offerToDelete.id);
      setSuccess('✅ Oferta eliminada exitosamente');
      loadOffers();
      handleCloseDeleteDialog();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar oferta');
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    try {
      if (offer.is_active) {
        await offerService.deactivateOffer(offer.id);
        setSuccess('✅ Oferta desactivada');
      } else {
        await offerService.activateOffer(offer.id);
        setSuccess('✅ Oferta activada');
      }
      loadOffers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ==================== HELPERS ====================

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      FLASH_SALE: '🔥 Venta Flash',
      DAILY_DEAL: '⭐ Oferta del Día',
      SEASONAL: '🎄 Temporada',
      CLEARANCE: '🏷️ Liquidación',
      PERSONALIZED: '🎯 Personalizada',
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'EXPIRED':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      DRAFT: '📝 Borrador',
      ACTIVE: '✅ Activa',
      PAUSED: '⏸️ Pausada',
      EXPIRED: '❌ Expirada',
      CANCELLED: '🚫 Cancelada',
    };
    return labels[status] || status;
  };

  // ==================== RENDER ====================

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">🎁 Administración de Ofertas</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:cart-3-bold" />}
          onClick={() => handleOpenModal()}
        >
          Nueva Oferta
        </Button>
      </Stack>

      {/* Alerts */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descuento</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Prioridad</TableCell>
                <TableCell>Fechas</TableCell>
                <TableCell>Estadísticas</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !offers || offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay ofertas creadas. Haz click en &quot;Nueva Oferta&quot; para comenzar.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={offer.id} hover>
                    <TableCell>#{offer.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {offer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {offer.description ? (
                          <>
                            {offer.description.substring(0, 50)}
                            {offer.description.length > 50 ? '...' : ''}
                          </>
                        ) : (
                          'Sin descripción'
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getTypeLabel(offer.offer_type)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${offer.discount_percentage}% OFF`}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(offer.status)}
                        color={getStatusColor(offer.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={offer.priority >= 5 ? `⭐ ${offer.priority}` : `${offer.priority}`}
                        color={offer.priority >= 5 ? 'warning' : 'default'}
                        size="small"
                        variant={offer.priority >= 5 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        📅 {new Date(offer.start_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" display="block">
                        🏁 {new Date(offer.end_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        👁️ {offer.views_count} | 🖱️ {offer.clicks_count}
                      </Typography>
                      <Typography variant="caption" display="block">
                        ✅ {offer.conversions_count} 
                        {offer.conversion_rate !== undefined && ` (${offer.conversion_rate.toFixed(1)}%)`}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {/* Editar */}
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenModal(offer)}
                          title="Editar oferta"
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>

                        {/* Activar/Desactivar */}
                        <IconButton
                          size="small"
                          color={offer.status === 'ACTIVE' ? 'warning' : 'success'}
                          onClick={() => handleToggleStatus(offer)}
                          disabled={offer.status === 'EXPIRED' || offer.status === 'CANCELLED'}
                          title={
                            offer.status === 'EXPIRED'
                              ? 'Oferta expirada'
                              : offer.status === 'ACTIVE'
                                ? 'Pausar oferta'
                                : 'Activar oferta'
                          }
                        >
                          <Iconify 
                            icon={offer.status === 'ACTIVE' ? 'solar:eye-closed-bold' : 'solar:eye-bold' as any} 
                          />
                        </IconButton>

                        {/* Eliminar */}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(offer)}
                          title="Eliminar oferta"
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Modal de Formulario */}
      <OfferFormModal
        open={modalOpen}
        offer={selectedOffer}
        onClose={handleCloseModal}
        onSave={handleSaveOffer}
      />

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>⚠️ Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la oferta{' '}
            <strong>&quot;{offerToDelete?.name}&quot;</strong>?
          </Typography>
          <Typography variant="caption" color="text.secondary" mt={1} display="block">
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteOffer} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
