import { Icon } from '@iconify/react';
import React, { useState } from 'react';

import {
  Box,
  List,
  Chip,
  Badge,
  Button,
  Popover,
  Divider,
  ListItem,
  IconButton,
  Typography,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';

import { useNotifications } from '../../hooks/useNotifications';

import type { Notification } from '../../types/notification';

interface NotificationBellProps {
  userId?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
  } = useNotifications();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: number) => {
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleLoadMore = async () => {
    const nextPage = Math.ceil(notifications.length / 20) + 1;
    await loadNotifications(nextPage, 20);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_delivered':
      case 'payment_received':
      case 'price_drop':
        return 'success';
      case 'order_shipped':
      case 'back_in_stock':
        return 'info';
      case 'new_offer':
      case 'offer_expiring':
        return 'warning';
      case 'order_cancelled':
      case 'payment_failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Ahora';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return date.toLocaleDateString();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Icon icon="mdi:bell" width={24} height={24} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div">
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ mt: 1 }}
            >
              Marcar todas como leídas
            </Button>
          )}
        </Box>

        <List sx={{ maxHeight: 350, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No hay notificaciones"
                secondary="Las nuevas notificaciones aparecerán aquí"
              />
            </ListItem>
          ) : (
            notifications.map((notification: Notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.is_read ? 'transparent' : 'action.hover',
                    '&:hover': { backgroundColor: 'action.selected' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.notification_type}
                          size="small"
                          color={getTypeColor(notification.notification_type)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!notification.is_read && (
                        <Button
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Leer
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Icon icon="mdi:close" width={16} height={16} />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>

        {notifications.length >= 20 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Cargar más'}
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};