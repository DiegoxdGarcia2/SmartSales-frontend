import { useState } from 'react';

import { Tab, Box, Tabs, Container } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { AdminProductView } from 'src/sections/admin-product';
import { AdminBrandView } from 'src/sections/admin-brand/view';
import { AdminCategoryView } from 'src/sections/admin-category/view';

// ----------------------------------------------------------------------

export default function AdminProductsPage() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <title>{`Gestión de Productos - ${CONFIG.appName}`}</title>

      <Container maxWidth="xl">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleChangeTab}>
            <Tab label="Productos" />
            <Tab label="Categorías" />
            <Tab label="Marcas" />
          </Tabs>
        </Box>

        {currentTab === 0 && <AdminProductView />}
        {currentTab === 1 && <AdminCategoryView />}
        {currentTab === 2 && <AdminBrandView />}
      </Container>
    </>
  );
}
