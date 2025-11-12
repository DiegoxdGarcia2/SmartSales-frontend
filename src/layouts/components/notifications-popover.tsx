import type { Notification } from 'src/types/notification';
import type { IconButtonProps } from '@mui/material/IconButton';

import { useState , useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useNotifications } from 'src/hooks/useNotifications';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { NOTIFICATION_ICONS, NOTIFICATION_COLORS } from 'src/types/notification';

// ----------------------------------------------------------------------

export type NotificationsPopoverProps = IconButtonProps;

export function NotificationsPopover({ sx, ...other }: NotificationsPopoverProps) {
  const navigate = useNavigate();
  const { unreadCount, notifications, loading, markAsRead, markAllAsRead, fetchNotifications } =
    useNotifications();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenPopover(event.currentTarget);
      fetchNotifications();
    },
    [fetchNotifications]
  );

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Marcar como leída
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      // Cerrar popover
      handleClosePopover();

      // Redirigir si tiene action_url
      if (notification.action_url) {
        navigate(notification.action_url);
      } else {
        // Redirigir según tipo
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
            // No hacer nada
            break;
        }
      }
    },
    [markAsRead, handleClosePopover, navigate]
  );

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 400,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notificaciones</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tienes {unreadCount} mensajes sin leer
            </Typography>
          </Box>

          {unreadCount > 0 && (
            <Tooltip title="Marcar todas como leídas">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={32} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Iconify icon={'solar:bell-off-bold-duotone' as any} width={48} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
          <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 400 } }}>
            {unreadNotifications.length > 0 && (
              <List
                disablePadding
                subheader={
                  <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                    Nuevas
                  </ListSubheader>
                }
              >
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </List>
            )}

            {readNotifications.length > 0 && (
              <List
                disablePadding
                subheader={
                  <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                    Anteriores
                  </ListSubheader>
                }
              >
                {readNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </List>
            )}
          </Scrollbar>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            disableRipple
            color="inherit"
            onClick={() => {
              handleClosePopover();
              navigate('/notifications');
            }}
          >
            Ver todas
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const icon = NOTIFICATION_ICONS[notification.notification_type] || 'solar:bell-bold';
  const color = NOTIFICATION_COLORS[notification.notification_type] || 'default';

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(!notification.is_read && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Chip
          icon={<Iconify icon={icon as any} width={18} />}
          label=""
          size="small"
          color={color as any}
          sx={{ width: 40, height: 40, borderRadius: '50%' }}
        />
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {notification.title}
            </Typography>
            {!notification.is_read && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'info.main',
                }}
              />
            )}
          </Box>
        }
        secondary={
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {notification.message}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                gap: 0.5,
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
              }}
            >
              <Iconify width={14} icon="solar:clock-circle-outline" />
              {fToNow(notification.created_at)}
            </Typography>
          </>
        }
      />
    </ListItemButton>
  );
}
