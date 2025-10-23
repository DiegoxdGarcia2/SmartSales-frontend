import { useState } from 'react';

import { Tab, Box, Tabs, Container } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { UserView } from 'src/sections/user/view';
import { AdminRoleView } from 'src/sections/admin-role/view';

// ----------------------------------------------------------------------

export default function Page() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <title>{`Users - ${CONFIG.appName}`}</title>

      <Container maxWidth="xl">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleChangeTab}>
            <Tab label="Usuarios" />
            <Tab label="Roles" />
          </Tabs>
        </Box>

        {currentTab === 0 && <UserView />}
        {currentTab === 1 && <AdminRoleView />}
      </Container>
    </>
  );
}
