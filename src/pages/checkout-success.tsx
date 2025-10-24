import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Opcional: Limpiar el carrito local cuando llegue a esta página
    console.log('✅ Pago completado exitosamente');
  }, []);

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <DashboardContent maxWidth="sm">
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Icono de éxito */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify
              icon="solar:check-circle-bold"
              width={80}
              sx={{ color: 'success.main' }}
            />
          </Box>

          {/* Título */}
          <Typography variant="h3" color="success.main">
            ¡Pago Exitoso!
          </Typography>

          {/* Mensaje */}
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
            Tu pago ha sido procesado correctamente. Recibirás un correo electrónico con los
            detalles de tu pedido.
          </Typography>

          {/* Información adicional */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              width: '100%',
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />
                <Typography variant="body2">Pago confirmado</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />
                <Typography variant="body2">Correo de confirmación enviado</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main' }} />
                <Typography variant="body2">Orden registrada en el sistema</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Botones de acción */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleViewOrders}
              startIcon={<Iconify icon="solar:eye-bold" />}
            >
              Ver Mis Pedidos
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={handleContinueShopping}
            >
              Seguir Comprando
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DashboardContent>
  );
}
