import { useEffect } from 'react';

import { CONFIG } from 'src/config-global';

import { OffersView } from 'src/sections/offers/view/offers-view';

// ========================================
// OFFERS PAGE
// ========================================

export default function OffersPage() {
  useEffect(() => {
    document.title = `Ofertas Especiales - ${CONFIG.appName}`;
  }, []);

  return <OffersView />;
}
