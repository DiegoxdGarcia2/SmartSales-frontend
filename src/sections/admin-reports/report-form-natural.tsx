import type { ReportRequestNatural } from 'src/types/report';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
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
  const [format, setFormat] = useState<'excel' | 'pdf' | 'json' | 'csv'>('excel');
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = () => {
    if (!prompt.trim()) {
      return;
    }

    // ✅ CONSTRUIR PROMPT MEJORADO CON INSTRUCCIONES EXPLÍCITAS
    let finalPrompt = prompt.trim();
    
    // 1. Detectar y mejorar agrupaciones
    const promptLower = finalPrompt.toLowerCase();
    if (promptLower.includes('agrupad') || promptLower.includes('agrupado')) {
      // Si ya tiene "agrupadas por X", hacer más explícito
      if (promptLower.includes('por categoría') || promptLower.includes('por categoria')) {
        finalPrompt = finalPrompt.replace(/agrupad[ao]s?\s+por\s+categor[ií]a/gi, 
          'con group_by="category" (resumido, no detallado)');
      } else if (promptLower.includes('por marca')) {
        finalPrompt = finalPrompt.replace(/agrupad[ao]s?\s+por\s+marca/gi, 
          'con group_by="brand" (resumido, no detallado)');
      } else if (promptLower.includes('por producto')) {
        finalPrompt = finalPrompt.replace(/agrupad[ao]s?\s+por\s+producto/gi, 
          'con group_by="product" (resumido, no detallado)');
      } else if (promptLower.includes('por mes')) {
        finalPrompt = finalPrompt.replace(/agrupad[ao]s?\s+por\s+mes/gi, 
          'con group_by="mes" (resumido, no detallado)');
      } else if (promptLower.includes('por cliente') || promptLower.includes('por usuario')) {
        finalPrompt = finalPrompt.replace(/agrupad[ao]s?\s+por\s+(cliente|usuario)/gi, 
          'con group_by="user" (resumido, no detallado)');
      }
    }
    
    // 2. Detectar si ya incluye formato
    const hasFormat = 
      finalPrompt.toLowerCase().includes('excel') || 
      finalPrompt.toLowerCase().includes('pdf') || 
      finalPrompt.toLowerCase().includes('json') ||
      finalPrompt.toLowerCase().includes('csv');
    
    // Si no tiene formato, agregarlo explícitamente
    if (!hasFormat) {
      const formatKeyword = format === 'excel' ? 'formato excel' : 
                           format === 'pdf' ? 'formato pdf' : 
                           format === 'json' ? 'formato json' : 
                           format === 'csv' ? 'formato csv' : 'formato excel';
      
      finalPrompt += ` en ${formatKeyword}`;
    }

    console.log('📤 Enviando prompt mejorado:', { 
      original: prompt, 
      final: finalPrompt,
      selectedFormat: format 
    });

    onSubmit({ prompt: finalPrompt });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <CardContent>
      <Stack spacing={2} sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          label="Describe el reporte que necesitas"
          multiline
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="✍️ Ejemplos específicos (IMPORTANTE: incluir fechas límite):

• ventas de Samsung de los últimos 30 días agrupadas por categoría (resumidas)
• productos con menos de 10 unidades en stock de la marca LG
• ventas de noviembre 2025 agrupadas por mes (totales mensuales)
• ventas de los últimos 30 días agrupadas por marca (comparar marcas)
• clientes registrados en los últimos 3 meses"
          helperText="⚠️ TIPS: 1) Incluye límites temporales (últimos X días). 2) Si quieres resumen, agrega '(resumidas)' o '(totales)' al final. 3) Presiona Ctrl+Enter para generar."
          disabled={loading}
        />

        <FormControl fullWidth>
          <InputLabel>Formato de salida</InputLabel>
          <Select
            value={format}
            label="Formato de salida"
            onChange={(e) => {
              const newFormat = e.target.value as 'excel' | 'pdf' | 'json' | 'csv';
              setFormat(newFormat);
              
              // Mostrar advertencia solo si no hay límites en el prompt
              if (!prompt.includes('último')) {
                setShowWarning(true);
              } else {
                setShowWarning(false);
              }
            }}
            disabled={loading}
          >
            <MenuItem value="excel">📊 Excel (.xlsx) - Recomendado</MenuItem>
            <MenuItem value="csv">📄 CSV (.csv) - Liviano</MenuItem>
            <MenuItem value="json">🖥️ JSON - Vista previa en pantalla</MenuItem>
            <MenuItem value="pdf">📄 PDF</MenuItem>
          </Select>
        </FormControl>

        {/* Advertencias específicas */}
        {format === 'json' && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <strong>💡 JSON muestra los datos en pantalla.</strong><br />
            Ideal para previsualizar resultados antes de descargar en Excel/PDF.
          </Alert>
        )}

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
