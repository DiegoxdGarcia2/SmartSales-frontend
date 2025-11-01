import type { ReportRequestNatural } from 'src/types/report';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ReportFormNaturalProps {
  loading: boolean;
  onSubmit: (request: ReportRequestNatural) => void;
}

export function ReportFormNatural({ loading, onSubmit }: ReportFormNaturalProps) {
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState<'excel' | 'pdf' | 'json'>('excel');

  const handleSubmit = () => {
    if (!prompt.trim()) {
      return;
    }

    // Agregar el formato al prompt si no está incluido
    let finalPrompt = prompt.trim();
    if (!finalPrompt.toLowerCase().includes('excel') && 
        !finalPrompt.toLowerCase().includes('pdf') && 
        !finalPrompt.toLowerCase().includes('json')) {
      finalPrompt += ` en ${format}`;
    }

    onSubmit({ prompt: finalPrompt });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <CardContent>
      <Stack spacing={3} sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Describe el reporte que necesitas"
          multiline
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ejemplos:
• ventas de Samsung en octubre 2024 por categoría
• productos más vendidos de los últimos 30 días
• clientes con más pedidos del año 2025
• reseñas de productos de la marca Nike"
          helperText="Presiona Ctrl+Enter para generar. Sé específico con fechas, marcas, categorías y agrupaciones."
          disabled={loading}
        />

        <FormControl fullWidth>
          <InputLabel>Formato de salida</InputLabel>
          <Select
            value={format}
            label="Formato de salida"
            onChange={(e) => setFormat(e.target.value as any)}
            disabled={loading}
          >
            <MenuItem value="excel">📊 Excel (.xlsx) - Recomendado</MenuItem>
            <MenuItem value="json">🖥️ JSON - Vista previa</MenuItem>
            <MenuItem value="pdf">📄 PDF - Requiere filtros específicos</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:pen-bold" />
            }
            fullWidth
          >
            {loading ? 'Generando reporte...' : 'Generar Reporte'}
          </Button>
        </Box>
      </Stack>
    </CardContent>
  );
}
