import type { Notification, NotificationType } from 'src/types/notification';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';

import { fToNow } from 'src/utils/format-time';

import notificationService from 'src/services/notificationService';

import { Iconify } from 'src/components/iconify';

import { NOTIFICATION_ICONS, NOTIFICATION_COLORS } from 'src/types/notification';

// ========================================
// NOTIFICATIONS PAGE
// ========================================

export function NotificationsView() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // ==================== CARGAR NOTIFICACIONES ====================

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotifications(page, 20);
      setNotifications(response.results);
      setTotalPages(Math.ceil(response.count / 20));
    } catch (err: any) {
      console.error('Error al cargar notificaciones:', err);
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ==================== ACCIONES ====================

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
      );
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Redirigir según tipo
    if (notification.action_url) {
      navigate(notification.action_url);
    } else {
      switch (notification.notification_type) {
        case 'order_created':
        case 'order_shipped':
        case 'order_delivered':
        case 'order_cancelled':
          if (notification.data?.order_id) {
            navigate(`/orders/${notification.data.order_id}`);
          }
          break;
        case 'new_offer':
        case 'offer_expiring':
          if (notification.data?.offer_id) {
            navigate(`/offers/${notification.data.offer_id}`);
          } else {
            navigate('/offers');
          }
          break;
        case 'payment_received':
        case 'payment_failed':
          navigate('/orders');
          break;
        default:
          break;
      }
    }
  };

  // ==================== FILTRAR NOTIFICACIONES ====================

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'unread') return !notif.is_read;
    if (filterType === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ==================== RENDER ====================

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              🔔 Notificaciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {unreadCount} sin leer
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon={'solar:settings-bold' as any} />}
              onClick={() => navigate('/settings/notifications')}
            >
              Configuración
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="contained"
                startIcon={<Iconify icon={'eva:done-all-fill' as any} />}
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </Button>
            )}
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Card>
          <Tabs value={filterType} onChange={(_, value) => setFilterType(value)}>
            <Tab
              label={`Todas (${notifications.length})`}
              value="all"
              icon={<Iconify icon={'solar:bell-bold' as any} width={20} />}
              iconPosition="start"
            />
            <Tab
              label={`Sin leer (${unreadCount})`}
              value="unread"
              icon={<Iconify icon={'solar:bell-bing-bold' as any} width={20} />}
              iconPosition="start"
            />
            <Tab
              label={`Leídas (${notifications.length - unreadCount})`}
              value="read"
              icon={<Iconify icon={'solar:check-circle-bold' as any} width={20} />}
              iconPosition="start"
            />
          </Tabs>
        </Card>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        )}

        {/* Notificaciones */}
        {!loading && filteredNotifications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon={'solar:bell-off-bold' as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay notificaciones
            </Typography>
          </Box>
        )}

        {!loading && filteredNotifications.length > 0 && (
          <Card>
            <List disablePadding>
              {filteredNotifications.map((notification, index) => (
                <Box key={notification.id}>
                  <NotificationListItem
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onDelete={() => handleDelete(notification.id)}
                  />
                  {index < filteredNotifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Card>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
          </Box>
        )}
      </Stack>
    </Container>
  );
}

// ========================================
// NOTIFICATION LIST ITEM
// ========================================

interface NotificationListItemProps {
  notification: Notification;
  onClick: () => void;
  onDelete: () => void;
}

function NotificationListItem({ notification, onClick, onDelete }: NotificationListItemProps) {
  const icon = NOTIFICATION_ICONS[notification.notification_type as NotificationType] || 'solar:bell-bold';
  const color = NOTIFICATION_COLORS[notification.notification_type as NotificationType] || 'default';

  return (
    <ListItemButton onClick={onClick} sx={{ py: 2, ...(!notification.is_read && { bgcolor: 'action.selected' }) }}>
      <ListItemAvatar>
        <Chip
          icon={<Iconify icon={icon as any} width={20} />}
          label=""
          size="medium"
          color={color as any}
          sx={{ width: 48, height: 48, borderRadius: '50%' }}
        />
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: notification.is_read ? 400 : 700 }}>
              {notification.title}
            </Typography>
            {!notification.is_read && (
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'info.main' }} />
            )}
          </Box>
        }
        secondary={
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {notification.message}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify width={14} icon={'solar:clock-circle-outline' as any} />
              {fToNow(notification.created_at)}
            </Typography>
          </>
        }
      />

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        sx={{ ml: 1 }}
      >
        <Iconify icon={'solar:trash-bin-trash-bold' as any} width={20} />
      </IconButton>
    </ListItemButton>
  );
}
