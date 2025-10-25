import { CONFIG } from 'src/config-global';

import { OrderDetailView } from 'src/sections/order-detail/view';

// ----------------------------------------------------------------------

export default function OrderDetailPage() {
  return (
    <>
      <title>{`Detalle del Pedido - ${CONFIG.appName}`}</title>

      <OrderDetailView />
    </>
  );
}
