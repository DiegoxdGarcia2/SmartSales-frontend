import type { Brand } from 'src/types/brand';
import type { Category } from 'src/types/category';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import api from 'src/utils/api';

import { Iconify } from 'src/components/iconify';

export function ReportsView() {
  // Tab: 'constructor' o 'prompt'
  const [tab, setTab] = useState('constructor');

  // --- Estados del Constructor ---
  const [module, setModule] = useState('ventas');
  const [dateRange, setDateRange] = useState('all_time');
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [filterBrand, setFilterBrand] = useState<Brand | null>(null);
  const [groupBy, setGroupBy] = useState('none');

  // --- Listas para Autocomplete ---
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);

  // --- Estado del Prompt de Texto (para Tab 2) ---
  const [promptText, setPromptText] = useState('');

  // --- Estados de Generación ---
  const [format, setFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonResult, setJsonResult] = useState<any | null>(null);

  // useEffect para cargar categorías y marcas
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get<Category[]>('/categories/'),
          api.get<Brand[]>('/brands/'),
        ]);
        setCategoriesList(catRes.data);
        setBrandsList(brandRes.data);
        console.log('✅ Filtros de categoría y marca cargados.');
      } catch (err) {
        console.error('❌ Error al cargar filtros:', err);
        setError('No se pudieron cargar las opciones de filtro (categorías/marcas).');
      }
    };
    fetchFilters();
  }, []);

  // Generar prompt automáticamente desde el constructor
  const generatePromptFromConstructor = (): string => {
    let prompt = '';

    // Tipo de módulo
    switch (module) {
      case 'ventas':
        prompt = 'ventas';
        break;
      case 'productos':
        prompt = 'productos';
        break;
      case 'clientes':
        prompt = 'clientes';
        break;
      case 'reseñas':
        prompt = 'reseñas';
        break;
      default:
        prompt = 'información';
    }

    // Rango de fechas
    let datePrompt = '';
    switch (dateRange) {
      case 'today':
        datePrompt = ' de hoy';
        break;
      case 'yesterday':
        datePrompt = ' de ayer';
        break;
      case 'last_7_days':
        datePrompt = ' de los últimos 7 días';
        break;
      case 'last_30_days':
        datePrompt = ' de los últimos 30 días';
        break;
      case 'last_6_months':
        datePrompt = ' de los últimos 6 meses';
        break;
      case 'year_2025':
        datePrompt = ' del año 2025';
        break;
      case 'year_2024':
        datePrompt = ' del año 2024';
        break;
      case 'year_2023':
        datePrompt = ' del año 2023';
        break;
      case 'all_time':
      default:
        datePrompt = '';
        break;
    }

    prompt += datePrompt;

    // Filtros
    let filterPrompt = '';
    if (filterCategory) {
      filterPrompt += ` de la categoria "${filterCategory.name}"`;
    }
    if (filterBrand) {
      filterPrompt += ` de la marca "${filterBrand.name}"`;
    }

    prompt += filterPrompt;

    // Agrupación
    let groupPrompt = '';
    if (groupBy !== 'none') {
      groupPrompt = ` agrupado por ${groupBy}`;
    }

    prompt += groupPrompt;

    return prompt;
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setJsonResult(null);

    let payload: any = {};

    if (tab === 'constructor') {
      // Construir prompt desde el constructor
      const generatedPrompt = generatePromptFromConstructor();

      if (!generatedPrompt || !module) {
        setError('Por favor, completa la configuración del reporte.');
        setLoading(false);
        return;
      }

      payload = {
        prompt: generatedPrompt,
        format,
      };
      console.log('📝 Enviando prompt generado:', generatedPrompt);
    } else {
      // Usar el prompt de texto directo
      if (!promptText) {
        setError('Por favor, ingresa un prompt.');
        setLoading(false);
        return;
      }
      payload = {
        prompt: promptText,
        format,
      };
      console.log('📝 Enviando prompt manual:', promptText);
    }

    try {
      const response = await api.post(
        '/reports/dynamic_report/',
        payload,
        {
          responseType: format === 'json' ? 'json' : 'blob',
        }
      );

      if (format === 'json') {
        if (response.data && response.data.message) {
          setJsonResult({ message: response.data.message });
        } else {
          setJsonResult(response.data);
        }
        console.log('✅ Reporte JSON generado');
      } else {
        const blob = new Blob([response.data], { type: response.headers['content-type'] });

        let filename = 'reporte';
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch.length > 1) {
            filename = filenameMatch[1];
          }
        } else {
          filename += format === 'pdf' ? '.pdf' : '.xlsx';
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        console.log('✅ Archivo descargado:', filename);
      }
    } catch (err: any) {
      console.error('❌ Error al generar reporte:', err);
      let errorMsg = 'Ocurrió un error inesperado.';

      if (err.code === 'ERR_NETWORK') {
        errorMsg =
          'Error de red. El servidor puede estar sobrecargado o sin memoria. Intenta con un reporte más simple o formato JSON.';
      } else if (err.response) {
        // El servidor respondió con un error
        if (err.response.status === 500) {
          errorMsg =
            'Error del servidor (500). Puede que se haya quedado sin memoria. Intenta con un reporte más simple o usa formato JSON.';
        } else if (err.response.data) {
          // Intentar leer el error del blob
          try {
            if (err.response.data instanceof Blob) {
              const errorText = await err.response.data.text();
              const errorJson = JSON.parse(errorText);
              if (errorJson.error) {
                errorMsg = errorJson.error;
              } else if (errorJson.message) {
                errorMsg = errorJson.message;
              }
            } else if (err.response.data.error) {
              errorMsg = err.response.data.error;
            } else if (typeof err.response.data === 'string') {
              errorMsg = err.response.data;
            }
          } catch {
            errorMsg = `Error ${err.response?.status || 'de Red'}: ${err.message}`;
          }
        }
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Generador de Reportes Dinámicos
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>⚠️ Advertencia PDF:</strong> Los reportes PDF consumen mucha memoria (512MB límite en Render). 
            Si obtienes error de memoria, usa <strong>filtros más específicos</strong> (últimos 7 días, una categoría), 
            o cambia a formato <strong>JSON</strong> o <strong>Excel</strong>.
          </Typography>
        </Alert>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>💡 Tip:</strong> El constructor genera prompts específicos que el backend debe
            interpretar correctamente. Usa filtros de fecha y categoría para limitar los resultados.
            Ejemplo: &quot;ventas de los últimos 7 días de la categoria &ldquo;Electrónica&rdquo;&quot;.
          </Typography>
        </Alert>
      </Stack>

      {/* Card Principal con Tabs */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
              <Tab label="Constructor de Reportes" value="constructor" />
              <Tab label="Prompt por Texto/Voz" value="prompt" />
            </Tabs>
          </Box>

          {/* === Tab 1: CONSTRUCTOR === */}
          {tab === 'constructor' && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* 1. Módulo */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="module-select-label">
                      1. ¿Qué información necesitas?
                    </InputLabel>
                    <Select
                      labelId="module-select-label"
                      value={module}
                      label="1. ¿Qué información necesitas?"
                      onChange={(e) => setModule(e.target.value)}
                    >
                      <MenuItem value="ventas">Ventas</MenuItem>
                      <MenuItem value="productos">Productos</MenuItem>
                      <MenuItem value="clientes">Clientes</MenuItem>
                      <MenuItem value="reseñas">Reseñas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 2. Rango de Fechas */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="date-range-label">2. Rango de Fechas</InputLabel>
                    <Select
                      labelId="date-range-label"
                      value={dateRange}
                      label="2. Rango de Fechas"
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <MenuItem value="all_time">Todo el tiempo</MenuItem>
                      <MenuItem value="today">Hoy</MenuItem>
                      <MenuItem value="yesterday">Ayer</MenuItem>
                      <MenuItem value="last_7_days">Últimos 7 días</MenuItem>
                      <MenuItem value="last_30_days">Últimos 30 días</MenuItem>
                      <MenuItem value="last_6_months">Últimos 6 meses</MenuItem>
                      <MenuItem value="year_2025">Año 2025</MenuItem>
                      <MenuItem value="year_2024">Año 2024</MenuItem>
                      <MenuItem value="year_2023">Año 2023</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 3. Filtro Categoría */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    options={categoriesList}
                    getOptionLabel={(option) => option.name}
                    value={filterCategory}
                    onChange={(e, newValue) => setFilterCategory(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="3. Filtrar por Categoría (Opcional)" />
                    )}
                    disabled={module === 'clientes'}
                  />
                </Grid>

                {/* 4. Filtro Marca */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    options={brandsList}
                    getOptionLabel={(option) => option.name}
                    value={filterBrand}
                    onChange={(e, newValue) => setFilterBrand(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="4. Filtrar por Marca (Opcional)" />
                    )}
                    disabled={module !== 'ventas' && module !== 'productos'}
                  />
                </Grid>

                {/* 5. Agrupar Por (Dinámico) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="group-by-label">5. Agrupar Por (Opcional)</InputLabel>
                    <Select
                      labelId="group-by-label"
                      value={groupBy}
                      label="5. Agrupar Por (Opcional)"
                      onChange={(e) => setGroupBy(e.target.value)}
                    >
                      <MenuItem value="none">Sin agrupar (Detallado)</MenuItem>
                      {/* Opciones condicionales */}
                      {module === 'ventas' && <MenuItem value="mes">Mes</MenuItem>}
                      {module === 'ventas' && <MenuItem value="category">Categoría</MenuItem>}
                      {module === 'ventas' && <MenuItem value="brand">Marca</MenuItem>}
                      {module === 'ventas' && <MenuItem value="product">Producto</MenuItem>}
                      {module === 'ventas' && <MenuItem value="user">Cliente</MenuItem>}
                      {module === 'productos' && <MenuItem value="brand">Marca</MenuItem>}
                      {module === 'productos' && <MenuItem value="category">Categoría</MenuItem>}
                      {module === 'reseñas' && <MenuItem value="product">Producto</MenuItem>}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Vista Previa del Prompt Generado */}
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" icon={<Iconify icon="solar:eye-bold" />}>
                    <Typography variant="subtitle2" gutterBottom>
                      Prompt generado:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                      &ldquo;{generatePromptFromConstructor()}&rdquo;
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* === Tab 2: PROMPT TEXTO/VOZ === */}
          {tab === 'prompt' && (
            <Box sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Escribe tu solicitud (o usa el micrófono)"
                multiline
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ej: ventas de los últimos 30 días en pdf agrupado por categoria"
                helperText="Sé específico con períodos de tiempo y agrupaciones. El backend interpreta el texto."
              />
            </Box>
          )}

          {/* --- Acciones (Botones) --- */}
          <Divider />
          <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 3 }} flexWrap="wrap">
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Formato</InputLabel>
              <Select value={format} label="Formato" onChange={(e) => setFormat(e.target.value)}>
                <MenuItem value="json">🖥️ Ver en Pantalla (JSON)</MenuItem>
                <MenuItem value="excel">📊 Excel (.xlsx)</MenuItem>
                <MenuItem value="pdf">
                  📄 PDF (.pdf) - ⚠️ Puede fallar si hay muchos datos
                </MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              disabled={
                loading ||
                (tab === 'constructor' && !module) ||
                (tab === 'prompt' && !promptText)
              }
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:pen-bold" />
              }
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </Button>
            {/* Aquí irá el botón de voz en el Punto 7 */}
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ m: 3, mt: 0 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultado JSON */}
      {jsonResult && (
        <Card sx={{ mt: 3 }}>
          <CardHeader title="Resultado (JSON)" />
          <CardContent>
            <Box sx={{ maxHeight: 400, overflowY: 'auto', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <pre style={{ margin: 0 }}>{JSON.stringify(jsonResult, null, 2)}</pre>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
