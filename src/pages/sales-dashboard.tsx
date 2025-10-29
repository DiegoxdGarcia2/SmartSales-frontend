import { CONFIG } from 'src/config-global';

import { SalesDashboardView } from 'src/sections/sales-dashboard/view';

// ----------------------------------------------------------------------

export default function SalesDashboardPage() {
  return (
    <>
      <title>{`Dashboard de Ventas - ${CONFIG.appName}`}</title>

      <SalesDashboardView />
    </>
  );
}
