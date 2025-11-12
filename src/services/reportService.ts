/**
 * Servicio para generación de reportes dinámicos
 * Soporta dos endpoints del backend:
 * 1. /reports/dynamic_report/ (actual, con prompt de lenguaje natural)
 * 2. /reports/generate/ (alternativo, con filtros estructurados)
 */

import api from 'src/utils/api';
import { downloadFile, isDownloadableFile } from 'src/utils/downloadFile';

// ============================================================================
// TIPOS
// ============================================================================

export interface ReportFilters {
  date_range?: {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
  };
  category?: number;
  category_ids?: number[];
  product_ids?: number[];
  brand_name?: string;
  category_name?: string;
}

export interface ReportRequestClassic {
  prompt: string;
  format: 'csv' | 'pdf' | 'json' | 'excel';
  filters?: ReportFilters;
}

export interface ReportRequestNatural {
  prompt: string;
}

export interface ReportResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

/**
 * Genera un reporte usando el endpoint /reports/generate/
 * Compatible con el formato especificado en los requisitos
 */
export const generateReport = async (reportData: ReportRequestClassic): Promise<ReportResponse> => {
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    console.log('📊 Generando reporte:', reportData);

    const response = await api.post('/reports/generate/', reportData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      responseType: reportData.format === 'json' ? 'json' : 'blob',
    });

    // Si es JSON, retornar data directamente
    if (reportData.format === 'json') {
      console.log('📊 Reporte JSON recibido:', response.data);
      return {
        success: true,
        data: response.data,
      };
    }

    // Si es CSV/PDF/Excel, descargar archivo
    const contentDisposition = response.headers['content-disposition'];
    const contentType = response.headers['content-type'];
    
    if (isDownloadableFile(contentType)) {
      downloadFile(response.data, contentDisposition);
      return {
        success: true,
        message: 'Archivo descargado correctamente',
      };
    }

    throw new Error('Formato de respuesta no reconocido');

  } catch (error: any) {
    console.error('❌ Error generando reporte:', error);
    
    // Manejar errores específicos
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      if (status === 400) {
        throw new Error(error.response.data?.error || 'Formato de solicitud incorrecto');
      }
      
      if (status === 500) {
        throw new Error('Error del servidor. Intenta con filtros más específicos.');
      }
    }
    
    throw error.response?.data || error;
  }
};

/**
 * Genera un reporte usando el endpoint /reports/dynamic_report/
 * Compatible con el sistema actual (prompt de lenguaje natural)
 */
export const generateDynamicReport = async (request: ReportRequestNatural | { options: any }): Promise<ReportResponse> => {
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    console.log('📊 Generando reporte dinámico:', request);

    const response = await api.post('/reports/dynamic_report/', request, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'blob',
    });

    // Descargar archivo
    const contentDisposition = response.headers['content-disposition'];
    downloadFile(response.data, contentDisposition);
    
    return {
      success: true,
      message: 'Archivo descargado correctamente',
    };

  } catch (error: any) {
    console.error('❌ Error generando reporte dinámico:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    throw error.response?.data || error;
  }
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Construye el objeto de filtros en el formato esperado por el backend
 */
export const buildFilters = (formData: {
  dateStart?: Date;
  dateEnd?: Date;
  categories?: Array<{ id: number }>;
  products?: Array<{ id: number }>;
  category?: { id: number };
}): ReportFilters => {
  const filters: ReportFilters = {};

  // Rango de fechas
  if (formData.dateStart && formData.dateEnd) {
    filters.date_range = {
      start: formData.dateStart.toISOString().split('T')[0], // YYYY-MM-DD
      end: formData.dateEnd.toISOString().split('T')[0],
    };
  }

  // Categorías (multi-select)
  if (formData.categories && formData.categories.length > 0) {
    filters.category_ids = formData.categories.map(c => c.id);
  }

  // Categoría única
  if (formData.category) {
    filters.category = formData.category.id;
  }

  // Productos (multi-select)
  if (formData.products && formData.products.length > 0) {
    filters.product_ids = formData.products.map(p => p.id);
  }

  return filters;
};

/**
 * Valida que el token JWT no esté expirado
 */
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('access_token');
  
  if (!token) return false;

  try {
    // Decodificar el token JWT (sin verificar firma)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    
    return Date.now() < exp;
  } catch (error) {
    console.error('Error validando token:', error);
    return false;
  }
};

/**
 * Valida los datos del reporte antes de enviarlo
 */
export const validateReportData = (reportData: ReportRequestClassic): string[] => {
  const errors: string[] = [];

  if (!reportData.prompt || reportData.prompt.trim() === '') {
    errors.push('El prompt es requerido');
  }

  if (!['csv', 'pdf', 'json', 'excel'].includes(reportData.format)) {
    errors.push('Formato inválido. Debe ser csv, pdf, json o excel');
  }

  if (reportData.filters?.date_range) {
    const { start, end } = reportData.filters.date_range;
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }

  return errors;
};

// ============================================================================
// REPORTES POR VOZ
// ============================================================================

/**
 * Genera un reporte usando comando de voz procesado por Gemini AI
 * @param audioBlob Audio grabado del usuario
 * @param format Formato opcional del reporte (pdf, excel, csv, json)
 * @returns Response con archivo descargable o datos JSON
 */
export const generateVoiceReport = async (
  audioBlob: Blob,
  format?: 'pdf' | 'excel' | 'csv' | 'json'
): Promise<ReportResponse> => {
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    console.log('🎤 Generando reporte por voz:', {
      audioSize: audioBlob.size,
      audioType: audioBlob.type,
      format,
    });

    // Crear FormData para enviar el audio
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-command.webm');
    
    if (format) {
      formData.append('format', format);
    }

    const isJsonFormat = format === 'json';

    const response = await api.post('/reports/voice_report/', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      responseType: isJsonFormat ? 'json' : 'blob',
    });

    console.log('📥 Respuesta de voice_report:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataType: typeof response.data,
    });

    // Si es JSON, retornar data directamente
    if (isJsonFormat) {
      console.log('📊 Reporte JSON por voz recibido:', response.data);
      return {
        success: true,
        data: response.data,
      };
    }

    // Si es archivo descargable, descargar
    const contentDisposition = response.headers['content-disposition'];
    const contentType = response.headers['content-type'];
    
    if (isDownloadableFile(contentType)) {
      downloadFile(response.data, contentDisposition);
      return {
        success: true,
        message: 'Reporte generado y descargado correctamente',
      };
    }

    throw new Error('Formato de respuesta no reconocido');

  } catch (error: any) {
    console.error('❌ Error generando reporte por voz:', error);
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      if (status === 400) {
        throw new Error(error.response.data?.error || 'No se pudo procesar el comando de voz');
      }
      
      if (status === 500) {
        throw new Error('Error del servidor al procesar el audio. Intenta nuevamente.');
      }
    }
    
    throw error.response?.data?.error || error.message || 'Error al generar reporte por voz';
  }
};
