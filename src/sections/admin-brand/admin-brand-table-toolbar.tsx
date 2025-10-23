import { Toolbar, OutlinedInput, InputAdornment } from '@mui/material';

import { Iconify } from 'src/components/iconify';

interface BrandTableToolbarProps {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BrandTableToolbar({
  filterName,
  onFilterName,
}: BrandTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
      }}
    >
      <OutlinedInput
        value={filterName}
        onChange={onFilterName}
        placeholder="Buscar marca..."
        startAdornment={
          <InputAdornment position="start">
            <Iconify
              icon="eva:search-fill"
              sx={{ color: 'text.disabled', width: 20, height: 20 }}
            />
          </InputAdornment>
        }
      />
    </Toolbar>
  );
}
