import { CONFIG } from 'src/config-global';

import { ReportsView } from 'src/sections/reports/view';

// ----------------------------------------------------------------------

export default function ReportsPage() {
  return (
    <>
      <title>{`Reportes Dinámicos - ${CONFIG.appName}`}</title>

      <ReportsView />
    </>
  );
}
