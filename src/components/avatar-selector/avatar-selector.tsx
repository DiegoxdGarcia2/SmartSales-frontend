import { useState } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type AvatarSelectorProps = {
  currentAvatar: number;
  onSelect: (avatarNumber: number) => void;
  open: boolean;
  onClose: () => void;
};

export function AvatarSelector({ currentAvatar, onSelect, open, onClose }: AvatarSelectorProps) {
  const [selected, setSelected] = useState(currentAvatar);

  const handleClose = () => {
    setSelected(currentAvatar);
    onClose();
  };

  const handleSave = () => {
    onSelect(selected);
    onClose();
  };

  // Generar array de avatares (1-10)
  const avatars = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Seleccionar Avatar</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 2,
              pt: 2,
            }}
          >
            {avatars.map((num) => (
              <Box
                key={num}
                onClick={() => setSelected(num)}
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Avatar
                  src={`/assets/avatars/avatar-${num}.png`}
                  sx={{
                    width: 64,
                    height: 64,
                    border: selected === num ? '3px solid' : '2px solid',
                    borderColor: selected === num ? 'primary.main' : 'divider',
                    boxShadow: selected === num ? 4 : 1,
                  }}
                />
                {selected === num && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="eva:checkmark-fill" width={16} color="white" />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
  );
}
