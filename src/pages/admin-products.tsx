import { CONFIG } from 'src/config-global';

import { AdminProductView } from 'src/sections/admin-product/view';

// ----------------------------------------------------------------------

export default function AdminProductsPage() {
  return (
    <>
      <title>{`Gestión de Productos - ${CONFIG.appName}`}</title>

      <AdminProductView />
    </>
  );
}
