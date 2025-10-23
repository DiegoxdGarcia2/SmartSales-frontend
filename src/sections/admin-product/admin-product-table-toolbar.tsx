import type { Brand } from 'src/types/brand';
import type { Category } from 'src/types/category';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type AdminProductTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  categories?: Category[];
  brands?: Brand[];
  filterCategory: number | '';
  filterBrand: number | '';
  onFilterCategory: (categoryId: number | '') => void;
  onFilterBrand: (brandId: number | '') => void;
};

export function AdminProductTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  categories = [],
  brands = [],
  filterCategory,
  filterBrand,
  onFilterCategory,
  onFilterBrand,
}: AdminProductTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        minHeight: 96,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: (theme) => theme.spacing(2, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {numSelected > 0 ? (
          <Typography component="div" variant="subtitle1">
            {numSelected} seleccionado{numSelected > 1 ? 's' : ''}
          </Typography>
        ) : (
          <OutlinedInput
            fullWidth
            value={filterName}
            onChange={onFilterName}
            placeholder="Buscar producto..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            sx={{ maxWidth: 400 }}
          />
        )}

        {numSelected > 0 ? (
          <Tooltip title="Eliminar">
            <IconButton>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filtros activos">
            <IconButton>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {numSelected === 0 && (
        <Box sx={{ width: '100%', display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filterCategory}
              label="Categoría"
              onChange={(e) => onFilterCategory(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>Todas las categorías</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Marca</InputLabel>
            <Select
              value={filterBrand}
              label="Marca"
              onChange={(e) => onFilterBrand(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>Todas las marcas</em>
              </MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Toolbar>
  );
}
