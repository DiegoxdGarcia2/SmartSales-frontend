import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { useCart } from 'src/contexts/CartContext';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CartWidgetProps {
  onClick?: () => void;
}

export function CartWidget({ onClick }: CartWidgetProps) {
  const { cart } = useCart();

  // Calcular el número total de items en el carrito
  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleCartClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Tooltip title="Carrito de compras" arrow>
      <IconButton onClick={handleCartClick} sx={{ width: 40, height: 40 }}>
        <Badge badgeContent={totalItems} color="error">
          <Iconify icon="solar:cart-3-bold" width={24} />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
