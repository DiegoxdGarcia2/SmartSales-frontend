import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useProducts } from 'src/contexts/ProductContext';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export type FiltersProps = {
  price: string;
  rating: string;
  marca: string[];
  garantia: string[];
  category: string;
};

type ProductFiltersProps = {
  canReset: boolean;
  openFilter: boolean;
  filters: FiltersProps;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onResetFilter: () => void;
  onSetFilters: (updateState: Partial<FiltersProps>) => void;
  options: {
    marcas: string[];
    garantias: string[];
    ratings: string[];
    categories: { value: string; label: string }[];
    price: { value: string; label: string }[];
  };
};

export function ProductFilters({
  filters,
  options,
  canReset,
  openFilter,
  onSetFilters,
  onOpenFilter,
  onCloseFilter,
  onResetFilter,
}: ProductFiltersProps) {
  const { categories } = useProducts();

  const renderMarca = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Marca</Typography>
      <FormGroup>
        {options.marcas.map((marca) => (
          <FormControlLabel
            key={marca}
            control={
              <Checkbox
                checked={filters.marca.includes(marca)}
                onChange={() => {
                  const checked = filters.marca.includes(marca)
                    ? filters.marca.filter((value) => value !== marca)
                    : [...filters.marca, marca];

                  onSetFilters({ marca: checked });
                }}
              />
            }
            label={marca}
          />
        ))}
      </FormGroup>
    </Stack>
  );

  const renderCategory = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Categoría</Typography>
      <RadioGroup>
        <FormControlLabel
          value="all"
          control={
            <Radio
              checked={filters.category === 'all'}
              onChange={() => onSetFilters({ category: 'all' })}
            />
          }
          label="Todas"
        />
        {categories.map((category) => (
          <FormControlLabel
            key={category.id}
            value={category.id.toString()}
            control={
              <Radio
                checked={filters.category === category.id.toString()}
                onChange={() => onSetFilters({ category: category.id.toString() })}
              />
            }
            label={category.name}
          />
        ))}
      </RadioGroup>
    </Stack>
  );

  const renderGarantia = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Garantía</Typography>
      <FormGroup>
        {options.garantias.map((garantia) => (
          <FormControlLabel
            key={garantia}
            control={
              <Checkbox
                checked={filters.garantia.includes(garantia)}
                onChange={() => {
                  const checked = filters.garantia.includes(garantia)
                    ? filters.garantia.filter((value) => value !== garantia)
                    : [...filters.garantia, garantia];

                  onSetFilters({ garantia: checked });
                }}
              />
            }
            label={garantia}
          />
        ))}
      </FormGroup>
    </Stack>
  );

  const renderPrice = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Precio</Typography>
      <RadioGroup>
        {options.price.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <Radio
                checked={filters.price.includes(option.value)}
                onChange={() => onSetFilters({ price: option.value })}
              />
            }
            label={option.label}
          />
        ))}
      </RadioGroup>
    </Stack>
  );

  const renderRating = (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Calificación
      </Typography>

      {options.ratings.map((option, index) => (
        <Box
          key={option}
          onClick={() => onSetFilters({ rating: option })}
          sx={{
            mb: 1,
            gap: 1,
            ml: -1,
            p: 0.5,
            display: 'flex',
            borderRadius: 1,
            cursor: 'pointer',
            typography: 'body2',
            alignItems: 'center',
            '&:hover': { opacity: 0.48 },
            ...(filters.rating === option && {
              bgcolor: 'action.selected',
            }),
          }}
        >
          <Rating readOnly value={4 - index} /> y más
        </Box>
      ))}
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpenFilter}
      >
        Filtros
      </Button>

      <Drawer
        anchor="right"
        open={openFilter}
        onClose={onCloseFilter}
        slotProps={{
          paper: {
            sx: { width: 280, overflow: 'hidden' },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Filtros
          </Typography>

          <IconButton onClick={onResetFilter}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="solar:restart-bold" />
            </Badge>
          </IconButton>

          <IconButton onClick={onCloseFilter}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>

        <Divider />

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 3 }}>
            {renderCategory}
            {renderMarca}
            {renderGarantia}
            {renderPrice}
            {renderRating}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
