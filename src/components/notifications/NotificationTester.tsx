import { Icon } from '@iconify/react';
import React, { useState } from 'react';

import {
  Box,
  Card,
  Chip,
  Alert,
  Button,
  Divider,
  TextField,
  Typography,
  CardContent,
} from '@mui/material';

import { useNotifications } from '../../hooks/useNotifications';

export const NotificationTester: React.FC = () => {
  const {
    initialize,
    subscribeToProduct,
    unsubscribeFromProduct,
    updatePreferences,
    preferences,
    isInitialized,
  } = useNotifications();

  const [userId, setUserId] = useState('test-user-123');
  const [productId, setProductId] = useState('test-product-456');
  const [testMessage, setTestMessage] = useState('');
  const [testTitle, setTestTitle] = useState('Notificación de prueba');
  const [testType, setTestType] = useState('info');

  const handleInitialize = async () => {
    try {
      await initialize(userId);
      setTestMessage('✅ Servicio de notificaciones inicializado correctamente');
    } catch (error) {
      setTestMessage('❌ Error al inicializar el servicio: ' + error);
    }
  };

  const handleSubscribeToProduct = async () => {
    try {
      await subscribeToProduct(productId);
      setTestMessage('✅ Suscripción al producto realizada correctamente');
    } catch (error) {
      setTestMessage('❌ Error al suscribirse: ' + error);
    }
  };

  const handleUnsubscribeFromProduct = async () => {
    try {
      await unsubscribeFromProduct(productId);
      setTestMessage('✅ Cancelación de suscripción realizada correctamente');
    } catch (error) {
      setTestMessage('❌ Error al cancelar suscripción: ' + error);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await updatePreferences({
        orders_in_app: true,
        orders_push: true,
        orders_email: true,
        offers_in_app: true,
        offers_push: true,
        offers_email: false,
        system_in_app: true,
        system_push: true,
        system_email: true,
      });
      setTestMessage('✅ Preferencias actualizadas correctamente');
    } catch (error) {
      setTestMessage('❌ Error al actualizar preferencias: ' + error);
    }
  };

  const handleTestNotification = () => {
    // Simular una notificación entrante
    const mockPayload = {
      notification: {
        title: testTitle,
        body: testMessage || 'Esta es una notificación de prueba',
      },
      data: {
        type: testType,
        action: 'test',
        timestamp: new Date().toISOString(),
      },
    };

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('notification-received', {
      detail: mockPayload,
    }));

    setTestMessage('🔔 Notificación de prueba enviada al listener');
  };

  const handleTestBackgroundNotification = () => {
    // Simular recepción de notificación en background
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Simular mensaje desde el service worker
        registration.active?.postMessage({
          type: 'NOTIFICATION_CLICK',
          data: {
            title: 'Notificación en background',
            body: 'Esta notificación vino desde el service worker',
            data: { action: 'background-test' },
          },
        });
        setTestMessage('📱 Notificación en background simulada');
      });
    } else {
      setTestMessage('❌ Service Worker no disponible');
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Icon icon="mdi:flask" width={24} height={24} />
          <Typography variant="h5" sx={{ ml: 1 }}>
            Probador de Notificaciones
          </Typography>
        </Box>

        {testMessage && (
          <Alert severity={testMessage.includes('✅') ? 'success' : 'error'} sx={{ mb: 3 }}>
            {testMessage}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Chip
            label={isInitialized ? 'Inicializado' : 'No inicializado'}
            color={isInitialized ? 'success' : 'warning'}
            sx={{ mr: 1 }}
          />
          {preferences && (
            <Chip
              label={`Push: ${preferences.orders_push ? 'ON' : 'OFF'}`}
              color={preferences.orders_push ? 'success' : 'default'}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Inicialización */}
          <Box>
            <Typography variant="h6" gutterBottom>
              1. Inicialización del Servicio
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              <Button
                variant="contained"
                onClick={handleInitialize}
                disabled={isInitialized}
              >
                Inicializar Servicio
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Suscripciones */}
          <Box>
            <Typography variant="h6" gutterBottom>
              2. Suscripciones a Productos
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                label="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              <Button
                variant="outlined"
                onClick={handleSubscribeToProduct}
                disabled={!isInitialized}
              >
                Suscribirse
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleUnsubscribeFromProduct}
                disabled={!isInitialized}
              >
                Cancelar Suscripción
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Preferencias */}
          <Box>
            <Typography variant="h6" gutterBottom>
              3. Preferencias de Notificación
            </Typography>
            <Button
              variant="outlined"
              onClick={handleUpdatePreferences}
              disabled={!isInitialized}
            >
              Actualizar Preferencias
            </Button>
          </Box>

          <Divider />

          {/* Pruebas de notificaciones */}
          <Box>
            <Typography variant="h6" gutterBottom>
              4. Pruebas de Notificaciones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Título"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  select
                  label="Tipo"
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                  SelectProps={{ native: true }}
                >
                  <option value="info">Info</option>
                  <option value="success">Éxito</option>
                  <option value="warning">Advertencia</option>
                  <option value="error">Error</option>
                </TextField>
              </Box>
              <TextField
                label="Mensaje"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                multiline
                rows={2}
                size="small"
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleTestNotification}
                  disabled={!isInitialized}
                >
                  Probar Notificación Foreground
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleTestBackgroundNotification}
                  disabled={!isInitialized}
                >
                  Probar Notificación Background
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Instrucciones:</strong><br />
            1. Inicializa el servicio con un User ID<br />
            2. Prueba las suscripciones a productos<br />
            3. Actualiza las preferencias<br />
            4. Envía notificaciones de prueba para verificar el funcionamiento
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};