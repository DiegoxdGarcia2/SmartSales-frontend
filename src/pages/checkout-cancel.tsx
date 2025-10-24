import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  const handleReturnToCart = () => {
    navigate('/products');
  };

  const handleContactSupport = () => {
    // Aquí podrías abrir un modal de soporte o redirigir a una página de contacto
    console.log('Contactar soporte');
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
          {/* Icono de cancelación */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify
              icon="mingcute:close-line"
              width={80}
              sx={{ color: 'warning.main' }}
            />
          </Box>

          {/* Título */}
          <Typography variant="h3" color="warning.main">
            Pago Cancelado
          </Typography>

          {/* Mensaje */}
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
            Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu tarjeta.
            Tu carrito se mantiene guardado y puedes continuar cuando estés listo.
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
                <Iconify icon="solar:restart-bold" width={20} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">Tu carrito está guardado</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">No se realizó ningún cargo</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:cart-3-bold" width={20} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">Puedes completar tu compra en cualquier momento</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Botones de acción */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleReturnToCart}
              startIcon={<Iconify icon="solar:cart-3-bold" />}
            >
              Volver a Productos
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={handleContactSupport}
              startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
            >
              Contactar Soporte
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DashboardContent>
  );
}
