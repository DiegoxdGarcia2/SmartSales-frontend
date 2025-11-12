import type { ReportRequest } from 'src/types/report';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';

import api from 'src/utils/api';
import { downloadFile } from 'src/utils/downloadFile';

import { generateVoiceReport } from 'src/services/reportService';

import { VoiceRecorder } from 'src/components/voice-recorder';

import { ReportFormNatural } from '../report-form-natural';
import { ReportFormStructured } from '../report-form-structured';

// ----------------------------------------------------------------------

export function AdminReportsView() {
  const [tab, setTab] = useState<'natural' | 'structured'>('natural');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('excel');

  // Función para formatear nombres de columnas
  const formatColumnName = (key: string): string => {
    const columnMap: Record<string, string> = {
      // Ventas
      'order__id': 'ID Orden',
      'order__created_at': 'Fecha',
      'order__user__username': 'Cliente',
      'product__name': 'Producto',
      'product__category__name': 'Categoría',
      'product__brand__name': 'Marca',
      'quantity': 'Cantidad',
      'unit_price': 'Precio Unitario',
      'total_price': 'Precio Total',
      
      // Productos
      'id': 'ID',
      'name': 'Nombre',
      'description': 'Descripción',
      'price': 'Precio',
      'stock': 'Stock',
      'category__name': 'Categoría',
      'brand__name': 'Marca',
      'created_at': 'Fecha Creación',
      
      // Clientes
      'username': 'Usuario',
      'email': 'Email',
      'first_name': 'Nombre',
      'last_name': 'Apellido',
      'phone_number': 'Teléfono',
      'date_joined': 'Fecha Registro',
      
      // Reseñas
      'user__username': 'Usuario',
      'rating': 'Calificación',
      'comment': 'Comentario',
      
      // Agrupaciones
      'Categoría': 'Categoría',
      'Marca': 'Marca',
      'Producto': 'Producto',
      'Cliente': 'Cliente',
      'Mes': 'Mes',
      'Ventas Totales': 'Ventas Totales',
      'Unidades Vendidas': 'Unidades Vendidas',
      'Nro. Ventas': 'Nro. Ventas',
    };

    return columnMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleGenerateReport = async (request: ReportRequest) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setJsonData(null); // Limpiar datos anteriores

      // ✅ DETERMINAR FORMATO CORRECTAMENTE
      let format: 'excel' | 'pdf' | 'json' | 'csv' = 'excel'; // Default
      
      if ('options' in request) {
        // Modo estructurado: formato viene en options
        format = request.options.format;
      } else {
        // Modo natural: inferir formato del prompt
        const promptLower = request.prompt.toLowerCase();
        if (promptLower.includes('json')) {
          format = 'json';
        } else if (promptLower.includes('pdf')) {
          format = 'pdf';
        } else if (promptLower.includes('csv')) {
          format = 'csv';
        } else if (promptLower.includes('excel') || promptLower.includes('xlsx')) {
          format = 'excel';
        }
        // Si no se detecta, el backend lo inferirá (default: excel)
      }
      
      const isJsonFormat = format === 'json';

      // � FIX: Construir payload que SIEMPRE incluya el formato
      const payload = {
        ...request,      // Incluir todo el request original (prompt u options)
        format,  // ✅ AGREGAR FORMATO EXPLÍCITAMENTE
      };

      // �📤 LOGS DE DEBUGGING COMPLETO
      console.log('═══════════════════════════════════════════════════');
      console.log('📤 PAYLOAD ENVIADO AL BACKEND:');
      console.log('═══════════════════════════════════════════════════');
      console.log(JSON.stringify({
        endpoint: '/reports/dynamic_report/',
        method: 'POST',
        payload,          // ✅ Ahora incluye format explícitamente
        isJsonFormat,
        responseType: isJsonFormat ? 'json' : 'blob'
      }, null, 2));
      console.log('═══════════════════════════════════════════════════');
      
      // 🔧 FIX: Enviar payload con formato incluido
      const response = await api.post('/reports/dynamic_report/', payload, {
        responseType: isJsonFormat ? 'json' : 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response recibida:', {
        status: response.status,
        contentType: response.headers['content-type'],
        contentDisposition: response.headers['content-disposition'],
        dataType: typeof response.data,
        dataSize: response.data?.size,
        isJsonFormat,
      });

      // Si es JSON, mostrarlo en pantalla
      if (isJsonFormat) {
        console.log('📊 Respuesta JSON:', response.data);
        
        // ✅ NUEVA ESTRUCTURA: { data: [], count: number, title: string, headers: [] }
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log('✅ Estructura JSON nueva detectada:', {
            count: response.data.count,
            title: response.data.title,
            headers: response.data.headers,
            records: response.data.data.length,
          });
          
          setJsonData(response.data.data);
          setSuccess(`✅ ${response.data.title || 'Reporte JSON generado'}: ${response.data.count || response.data.data.length} registro(s)`);
          setLoading(false);
          return;
        }
        
        // ✅ ESTRUCTURA ANTIGUA: Array directo (retrocompatibilidad)
        if (Array.isArray(response.data)) {
          console.log('✅ Estructura JSON antigua detectada (array directo)');
          setJsonData(response.data);
          setSuccess(`✅ Reporte JSON generado: ${response.data.length} registro(s)`);
          setLoading(false);
          return;
        }
        
        // ❌ Formato no reconocido
        console.error('❌ Error: El backend no devolvió un formato JSON válido. Recibido:', typeof response.data);
        
        // Si el backend devolvió un Blob de Excel por error
        if (response.data instanceof Blob || response.data?.size !== undefined) {
          console.log('⚠️ El backend devolvió un archivo en lugar de JSON. Descargando...');
          const blob = response.data;
          const contentDisposition = response.headers['content-disposition'];
          downloadFile(blob, contentDisposition);
          
          const filenameMatch = contentDisposition?.match(/filename[^;=\n]*=\s*"?([^";\n]+)"?/i);
          const filename = filenameMatch?.[1]?.replace(/['"]/g, '').trim() || 'reporte';
          
          setError('⚠️ El backend generó un archivo Excel en lugar de JSON. Se ha descargado automáticamente.');
          setLoading(false);
          return;
        }
        
        throw new Error('El backend no devolvió un formato JSON válido. Formato recibido: ' + typeof response.data);
      }

      // ✅ VALIDAR SI EL BLOB CONTIENE JSON DE ERROR
      const blob = response.data; // Ya es un Blob con responseType: 'blob'
      
      // Verificar si el Blob contiene JSON de error en lugar de archivo válido
      if (blob.type.includes('application/json') || blob.size < 1000) {
        try {
          const text = await blob.text();
          const jsonError = JSON.parse(text);
          
          if (jsonError.message || jsonError.error) {
            console.error('❌ Error del backend (JSON en Blob):', jsonError);
            throw new Error(jsonError.message || jsonError.error || 'Error al generar el reporte');
          }
        } catch {
          // Si no es JSON o no se puede parsear, continuar con descarga normal
          console.log('✅ Blob es un archivo válido (no es JSON de error)');
        }
      }

      // ✅ Usar utilidad de descarga centralizada
      const contentDisposition = response.headers['content-disposition'];
      
      console.log('💾 Blob a descargar:', {
        size: blob.size,
        type: blob.type,
        contentDisposition,
      });

      // Descargar usando la utilidad
      downloadFile(blob, contentDisposition);

      // Extraer filename para el mensaje de éxito
      const filenameMatch = contentDisposition?.match(/filename[^;=\n]*=\s*"?([^";\n]+)"?/i);
      const filename = filenameMatch?.[1]?.replace(/['"]/g, '').trim() || 'reporte';

      setSuccess(`✅ Reporte descargado: ${filename}`);
      console.log('✅ Reporte descargado:', filename);

      // Guardar en historial (localStorage)
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        mode: tab,
        request,
        filename,
        success: true,
      };
      const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
      history.unshift(historyItem);
      localStorage.setItem('reportHistory', JSON.stringify(history.slice(0, 20))); // Últimos 20
    } catch (err: any) {
      console.error('❌ Error al generar reporte:', err);
      console.error('❌ Response completa:', err.response);

      let errorMsg = 'Error al generar el reporte';
      let serverError = null;

      if (err.response) {
        // Intentar extraer mensaje detallado del servidor
        try {
          if (err.response.data instanceof Blob) {
            const errorText = await err.response.data.text();
            console.log('📄 Error del servidor (texto):', errorText);
            try {
              const errorJson = JSON.parse(errorText);
              serverError = errorJson.error || errorJson.detail || errorJson.message;
              console.log('📄 Error del servidor (JSON):', serverError);
            } catch {
              // Es HTML u otro formato
              serverError = errorText.substring(0, 300);
            }
          } else if (typeof err.response.data === 'object') {
            serverError = err.response.data.error || err.response.data.detail || err.response.data.message;
            console.log('📄 Error del servidor (objeto):', serverError);
          }
        } catch (parseError) {
          console.error('❌ Error al parsear respuesta:', parseError);
        }

        // Mensajes específicos por código
        if (err.response.status === 401) {
          errorMsg = 'No autorizado. Solo administradores pueden generar reportes.';
        } else if (err.response.status === 400) {
          errorMsg = serverError || 'Datos inválidos. Verifica los filtros y formato.';
        } else if (err.response.status === 500) {
          errorMsg = serverError 
            ? `Error del servidor: ${serverError}`
            : 'Error del servidor. Puede que se haya quedado sin memoria. Intenta con filtros más específicos.';
        } else {
          errorMsg = serverError || `Error ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Error de red. Verifica tu conexión o que el servidor esté disponible.';
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar reportes por voz
  const handleVoiceReport = async (audioBlob: Blob) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setJsonData(null);

      console.log('🎤 Procesando reporte por voz con formato:', selectedFormat);

      const response = await generateVoiceReport(audioBlob, selectedFormat);

      if (selectedFormat === 'json' && response.data) {
        // Manejar respuesta JSON con nueva estructura
        const jsonResponse = response.data;
        
        // Si tiene la estructura nueva { data, count, title, headers }
        if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
          setJsonData(jsonResponse.data);
          setSuccess(`✅ ${jsonResponse.title || 'Reporte generado'}: ${jsonResponse.count || jsonResponse.data.length} registro(s)`);
        } 
        // Si es un array directo (retrocompatibilidad)
        else if (Array.isArray(jsonResponse)) {
          setJsonData(jsonResponse);
          setSuccess(`✅ Reporte JSON generado: ${jsonResponse.length} registro(s)`);
        }
        else {
          throw new Error('Formato de respuesta JSON no válido');
        }
      } else {
        setSuccess(response.message || '✅ Reporte por voz generado correctamente');
      }
    } catch (err: any) {
      console.error('❌ Error en reporte por voz:', err);
      setError(err.message || 'Error al procesar el comando de voz. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="h4">
          Generador de Reportes Dinámicos
        </Typography>
        
        {/* Controles de voz */}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Formato Voz</InputLabel>
            <Select
              value={selectedFormat}
              label="Formato Voz"
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              disabled={loading}
            >
              <MenuItem value="excel">📊 Excel</MenuItem>
              <MenuItem value="pdf">📄 PDF</MenuItem>
              <MenuItem value="csv">📄 CSV</MenuItem>
              <MenuItem value="json">🖥️ JSON</MenuItem>
            </Select>
          </FormControl>
          
          {/* Botón de voz */}
          <VoiceRecorder 
            onAudioReady={handleVoiceReport}
            disabled={loading}
            maxDuration={10000}
          />
        </Stack>
      </Box>

      {/* Sin alertas innecesarias - Backend en Google Cloud es potente */}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab label="🗣️ Lenguaje Natural (Gemini IA)" value="natural" />
            <Tab label="⚙️ Modo Estructurado" value="structured" />
          </Tabs>
        </Box>

        {tab === 'natural' && (
          <ReportFormNatural loading={loading} onSubmit={handleGenerateReport} />
        )}

        {tab === 'structured' && (
          <ReportFormStructured loading={loading} onSubmit={(options) => handleGenerateReport({ options })} />
        )}
      </Card>

      {/* Tabla JSON */}
      {jsonData && Array.isArray(jsonData) && jsonData.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              📊 Resultado: {jsonData.length} registro(s)
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setJsonData(null)}
            >
              Cerrar
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(jsonData[0]).map((key) => (
                    <TableCell 
                      key={key} 
                      sx={{ 
                        fontWeight: 'bold', 
                        bgcolor: 'primary.lighter',
                        color: 'primary.darker',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {formatColumnName(key)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {jsonData.map((row, index) => (
                  <TableRow key={index} hover>
                    {Object.entries(row).map(([key, value]: [string, any], i) => (
                      <TableCell key={i}>
                        {typeof value === 'object' && value !== null
                          ? JSON.stringify(value)
                          : key.toLowerCase().includes('date') || key.toLowerCase().includes('created_at')
                          ? new Date(value).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : key.toLowerCase().includes('price') || key.toLowerCase().includes('total')
                          ? new Intl.NumberFormat('es-BO', {
                              style: 'currency',
                              currency: 'BOB',
                            }).format(Number(value))
                          : String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Container>
  );
}
