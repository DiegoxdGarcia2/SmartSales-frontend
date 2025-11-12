import type { BoxProps } from '@mui/material/Box';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { AvatarSelector } from 'src/components/avatar-selector';

import { useAuth } from 'src/auth/AuthContext';

// ----------------------------------------------------------------------

export type UserInfoProps = BoxProps;

export function UserInfo({ sx, ...other }: UserInfoProps) {
  const { user } = useAuth();

  // Estado local para el avatar seleccionado (luego se guardará en localStorage o backend)
  const [selectedAvatar, setSelectedAvatar] = useState<number>(() => {
    const saved = localStorage.getItem(`avatar-${user?.user_id}`);
    return saved ? parseInt(saved, 10) : (parseInt(user?.user_id || '1', 10) % 10) + 1;
  });

  const [openSelector, setOpenSelector] = useState(false);

  if (!user) return null;

  // Guardar la selección del avatar
  const handleAvatarChange = (avatarNumber: number) => {
    setSelectedAvatar(avatarNumber);
    localStorage.setItem(`avatar-${user.user_id}`, avatarNumber.toString());
    // TODO: Aquí puedes agregar una llamada al backend para guardar la preferencia
    // updateUserAvatar(avatarNumber);
  };
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Colores predefinidos para los avatares
  const avatarColors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', 
    '#43e97b', '#fa709a', '#fee140', '#30cfd0',
    '#a8edea', '#ff6b6b', '#4ecdc4', '#45b7d1'
  ];

  // Seleccionar color basado en el ID del usuario
  const getAvatarColor = () => {
    const userId = parseInt(user.user_id, 10);
    return avatarColors[userId % avatarColors.length];
  };



  // Determinar el color del rol
  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case 1:
        return 'error'; // ADMINISTRADOR
      case 2:
        return 'info'; // CLIENTE
      default:
        return 'default';
    }
  };

  return (
    <>
      <Box
        onClick={() => setOpenSelector(true)}
        sx={{
          pl: 2,
          py: 2.5,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            borderColor: 'rgba(102, 126, 234, 0.5)',
          },
          ...sx,
        }}
        {...other}
      >
        {/* Avatar con iniciales o imagen predefinida */}
        <Avatar
          alt={user.username}
          src={`/assets/avatars/avatar-${selectedAvatar}.png`}
          imgProps={{
            onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = 'none';
            },
          }}
          sx={{
            width: 40,
            height: 40,
            bgcolor: getAvatarColor(),
            fontSize: '0.875rem',
            fontWeight: 600,
            border: '2px solid',
            borderColor: 'background.paper',
          }}
        >
          {getInitials(user.username)}
        </Avatar>

      {/* Información del usuario */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          minWidth: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#ffffff',
          }}
        >
          {user.username}
        </Typography>
        <Label color={getRoleColor(user.role_id)} variant="soft">
          {user.role_name}
        </Label>
      </Box>
    </Box>

    <AvatarSelector 
      currentAvatar={selectedAvatar} 
      onSelect={handleAvatarChange}
      open={openSelector}
      onClose={() => setOpenSelector(false)}
    />
  </>
  );
}
