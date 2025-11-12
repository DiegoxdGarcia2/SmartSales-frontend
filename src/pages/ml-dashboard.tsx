import { CONFIG } from 'src/config-global';

import { MLDashboardView } from 'src/sections/ml-dashboard';

// ----------------------------------------------------------------------

export default function MLDashboardPage() {
  return (
    <>
      <title>{`Machine Learning Dashboard - ${CONFIG.appName}`}</title>

      <MLDashboardView />
    </>
  );
}
