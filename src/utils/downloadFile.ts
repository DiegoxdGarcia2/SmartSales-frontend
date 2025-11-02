/**
 * Utilidad para descargar archivos Blob desde respuestas HTTP
 * Extrae el nombre del archivo del header Content-Disposition y dispara la descarga
 */

export const downloadFile = (blob: Blob, contentDisposition?: string): void => {
  // Extraer filename base y extensión del header Content-Disposition
  let filename = 'reporte';
  let extension = '.csv'; // Extensión por defecto

  if (contentDisposition) {
    // Regex para extraer el nombre del archivo
    // Soporta: filename="archivo.csv" o filename=archivo.csv
    const filenameRegex = /filename[^;=\n]*=\s*"?([^";\n]+)"?/i;
    const matches = filenameRegex.exec(contentDisposition);
    
    if (matches && matches[1]) {
      const extracted = matches[1].replace(/['"]/g, '').trim();
      
      // Separar nombre base y extensión
      const extMatch = extracted.match(/\.(csv|pdf|xlsx|json)$/i);
      if (extMatch) {
        filename = extracted.replace(/\.(csv|pdf|xlsx|json)$/i, '');
        extension = extMatch[0].toLowerCase();
      } else {
        filename = extracted;
      }
    }
  }

  // ✅ Detectar extensión del Content-Type del Blob si no viene en filename
  const contentType = blob.type.toLowerCase();
  console.log('🔍 Content-Type del Blob:', contentType);
  
  if (contentType.includes('pdf')) {
    extension = '.pdf';
  } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
    extension = '.xlsx';
  } else if (contentType.includes('csv') || contentType.includes('text/csv')) {
    extension = '.csv';
  } else if (contentType.includes('json')) {
    extension = '.json';
  } else if (contentType.includes('octet-stream')) {
    // Si es octet-stream, mantener extensión del filename o usar default
    console.log('⚠️ Content-Type genérico (octet-stream), usando extensión del filename');
  }

  const finalFilename = `${filename}${extension}`;
  console.log(`💾 Descargando: ${finalFilename} (${blob.size} bytes, tipo: ${blob.type})`);

  // Crear URL temporal y descargar
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  link.setAttribute('download', finalFilename); // Para mayor compatibilidad
  
  // Agregar al DOM, hacer click, y limpiar
  document.body.appendChild(link);
  link.click();
  
  // Limpiar después de un delay para asegurar descarga
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);

  console.log(`✅ Archivo descargado exitosamente: ${finalFilename}`);
};

/**
 * Detecta si una respuesta es un archivo descargable basado en Content-Type
 */
export const isDownloadableFile = (contentType?: string): boolean => {
  if (!contentType) return false;
  
  const downloadableTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/csv',
    'application/octet-stream',
  ];
  
  return downloadableTypes.some(type => contentType.includes(type));
};

/**
 * Extrae el nombre de archivo del header Content-Disposition
 */
export const extractFilename = (contentDisposition?: string): string => {
  if (!contentDisposition) return 'reporte';
  
  const filenameRegex = /filename[^;=\n]*=\s*"?([^";\n]+)"?/i;
  const matches = filenameRegex.exec(contentDisposition);
  
  return matches?.[1]?.replace(/['"]/g, '').trim() || 'reporte';
};
