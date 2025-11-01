import type { ReportRequest } from 'src/types/report';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import api from 'src/utils/api';

import { ReportFormNatural } from '../report-form-natural';
import { ReportFormStructured } from '../report-form-structured';

// ----------------------------------------------------------------------

export function AdminReportsView() {
  const [tab, setTab] = useState<'natural' | 'structured'>('natural');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerateReport = async (request: ReportRequest) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('📝 Generando reporte:', request);

      const response = await api.post('/reports/dynamic_report/', request, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json', // Enviamos JSON
        },
      });

      console.log('📥 Response recibida:', {
        status: response.status,
        contentType: response.headers['content-type'],
        contentDisposition: response.headers['content-disposition'],
        dataType: typeof response.data,
        dataSize: response.data?.size,
      });

      // Extraer filename del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'reporte';

      if (contentDisposition) {
        // Regex más robusto para extraer filename
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=\s*"?([^";\n]+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
        }
      } else {
        // Generar nombre basado en el contenido
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const contentType = response.headers['content-type'];
        if (contentType?.includes('excel') || contentType?.includes('spreadsheet')) {
          filename = `reporte_${timestamp}.xlsx`;
        } else if (contentType?.includes('pdf')) {
          filename = `reporte_${timestamp}.pdf`;
        } else {
          filename = `reporte_${timestamp}.json`;
        }
      }

      // CRÍTICO: response.data YA ES un Blob cuando usamos responseType: 'blob'
      // No necesitamos crear un nuevo Blob, solo usarlo directamente
      const blob = response.data;
      
      console.log('💾 Blob a descargar:', {
        filename,
        size: blob.size,
        type: blob.type,
      });

      // Crear URL y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.setAttribute('download', filename); // Asegurar atributo download
      document.body.appendChild(link);
      link.click();
      
      // Limpiar después de un delay para asegurar descarga
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);

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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Generador de Reportes Dinámicos
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>💡 Tip:</strong> Usa filtros específicos (fechas, categorías, marcas) para
          reportes PDF. Los archivos PDF consumen mucha memoria del servidor.
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab label="🗣️ Lenguaje Natural" value="natural" />
            <Tab label="⚙️ Modo Estructurado" value="structured" />
          </Tabs>
        </Box>

        {tab === 'natural' && (
          <ReportFormNatural loading={loading} onSubmit={handleGenerateReport} />
        )}

        {tab === 'structured' && (
          <ReportFormStructured loading={loading} onSubmit={handleGenerateReport} />
        )}
      </Card>
    </Container>
  );
}
