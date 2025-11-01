import { CONFIG } from 'src/config-global';

import { AdminReportsView } from 'src/sections/admin-reports/view';

// ----------------------------------------------------------------------

export default function AdminReportsPage() {
  return (
    <>
      <title>{`Reportes Dinámicos - ${CONFIG.appName}`}</title>

      <AdminReportsView />
    </>
  );
}
