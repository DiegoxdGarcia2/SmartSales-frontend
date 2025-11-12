import type { NotificationPreferences } from 'src/types/notification';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useNotifications } from 'src/hooks/useNotifications';

import notificationService from 'src/services/notificationService';

import { Iconify } from 'src/components/iconify';

// ========================================
// NOTIFICATION SETTINGS PAGE
// ========================================

export function NotificationSettingsView() {
  const { permission, requestPermission } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    order_updates: true,
    promotions: true,
    product_recommendations: false,
    price_alerts: true,
  });

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ==================== CARGAR PREFERENCIAS ====================

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (err: any) {
      console.error('Error al cargar preferencias:', err);
      setError(err.message || 'Error al cargar preferencias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // ==================== GUARDAR PREFERENCIAS ====================

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await notificationService.updatePreferences(preferences);
      setSuccess('✅ Preferencias guardadas exitosamente');

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error al guardar preferencias:', err);
      setError(err.message || 'Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  // ==================== ACTUALIZAR PREFERENCIA ====================

  const handleToggle = (field: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ==================== SOLICITAR PERMISOS PUSH ====================

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Stack spacing={3} sx={{ py: 3 }}>
        {/* Header */}
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            ⚙️ Configuración de Notificaciones
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Personaliza cómo y cuándo quieres recibir notificaciones
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Permisos del Navegador */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Iconify icon={'solar:bell-bing-bold' as any} width={32} sx={{ color: 'primary.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">Notificaciones Push</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recibe notificaciones en tiempo real en tu navegador
                  </Typography>
                </Box>
                <Box>
                  {permission === 'granted' ? (
                    <Button variant="outlined" color="success" disabled startIcon={<Iconify icon={'solar:check-circle-bold' as any} />}>
                      Activadas
                    </Button>
                  ) : permission === 'denied' ? (
                    <Button variant="outlined" color="error" disabled startIcon={<Iconify icon={'solar:close-circle-bold' as any} />}>
                      Bloqueadas
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleRequestPermission}
                      startIcon={<Iconify icon={'solar:bell-bing-bold' as any} />}
                    >
                      Activar
                    </Button>
                  )}
                </Box>
              </Box>

              {permission === 'denied' && (
                <Alert severity="warning">
                  Has bloqueado las notificaciones. Para activarlas, ve a la configuración de tu navegador.
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Canales de Notificación */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Canales de Notificación
            </Typography>

            <Stack spacing={2} divider={<Divider />}>
              <FormControlLabel
                control={<Switch checked={preferences.email_enabled} onChange={() => handleToggle('email_enabled')} />}
                label={
                  <Box>
                    <Typography variant="subtitle1">Email</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recibir notificaciones por correo electrónico
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={preferences.push_enabled} onChange={() => handleToggle('push_enabled')} />}
                label={
                  <Box>
                    <Typography variant="subtitle1">Notificaciones Push</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recibir notificaciones push en el navegador
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Tipos de Notificaciones */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tipos de Notificaciones
            </Typography>

            <Stack spacing={2} divider={<Divider />}>
              <FormControlLabel
                control={
                  <Switch checked={preferences.order_updates} onChange={() => handleToggle('order_updates')} />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">Actualizaciones de Pedidos</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notificaciones sobre el estado de tus pedidos
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={preferences.promotions} onChange={() => handleToggle('promotions')} />}
                label={
                  <Box>
                    <Typography variant="subtitle1">Promociones y Ofertas</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recibir notificaciones sobre nuevas ofertas y descuentos
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.product_recommendations}
                    onChange={() => handleToggle('product_recommendations')}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">Recomendaciones de Productos</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sugerencias personalizadas basadas en tu historial
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={preferences.price_alerts} onChange={() => handleToggle('price_alerts')} />}
                label={
                  <Box>
                    <Typography variant="subtitle1">Alertas de Precio</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notificaciones cuando baja el precio de productos que te interesan
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={loadPreferences} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Iconify icon={'solar:diskette-bold' as any} />}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
