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
      const response = await offerService.getOffers({
        page: page + 1,
        pageSize: rowsPerPage,
        ordering: '-created_at',
      });

      setOffers(response.results);
      setTotalCount(response.count);
    } catch (err: any) {
      setError(err.message || 'Error al cargar ofertas');
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
    if (selectedOffer) {
      // Actualizar
      await offerService.updateOffer(selectedOffer.id, offerData);
      setSuccess('✅ Oferta actualizada exitosamente');
    } else {
      // Crear
      await offerService.createOffer(offerData);
      setSuccess('✅ Oferta creada exitosamente');
    }
    loadOffers();
    setTimeout(() => setSuccess(null), 3000);
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
    switch (type) {
      case 'percentage':
        return '📊 Porcentaje';
      case 'fixed_amount':
        return '💵 Monto Fijo';
      case 'buy_x_get_y':
        return '🎁 Compra X Lleva Y';
      case 'free_shipping':
        return '🚚 Envío Gratis';
      default:
        return type;
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

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
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descuento</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fechas</TableCell>
                <TableCell>Usos</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !offers || offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay ofertas creadas. Haz click en &quot;Nueva Oferta&quot; para comenzar.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={offer.id} hover>
                    <TableCell>{offer.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {offer.title}
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
                      <Chip label={getTypeLabel(offer.offer_type)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          offer.offer_type === 'percentage'
                            ? `${offer.discount_value}% OFF`
                            : `$${offer.discount_value} OFF`
                        }
                        color="error"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          offer.is_active
                            ? isExpired(offer.end_date)
                              ? '❌ Expirada'
                              : '✅ Activa'
                            : '⏸️ Inactiva'
                        }
                        color={
                          offer.is_active
                            ? isExpired(offer.end_date)
                              ? 'error'
                              : 'success'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        Inicio: {new Date(offer.start_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Fin: {new Date(offer.end_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {offer.max_uses
                          ? `${offer.current_usage_count || 0}/${offer.max_uses}`
                          : offer.current_usage_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {/* Editar */}
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenModal(offer)}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>

                        {/* Activar/Desactivar */}
                        <IconButton
                          size="small"
                          color={offer.is_active ? 'warning' : 'success'}
                          onClick={() => handleToggleStatus(offer)}
                          disabled={isExpired(offer.end_date)}
                          title={
                            isExpired(offer.end_date)
                              ? 'No se puede activar una oferta expirada'
                              : offer.is_active
                                ? 'Desactivar'
                                : 'Activar'
                          }
                        >
                          <Iconify icon={offer.is_active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                        </IconButton>

                        {/* Eliminar */}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(offer)}
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
            <strong>&quot;{offerToDelete?.title}&quot;</strong>?
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
