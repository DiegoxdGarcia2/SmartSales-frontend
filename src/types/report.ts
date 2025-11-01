// Tipos para Reportes Dinámicos

export interface ReportFilters {
  brand_name?: string;
  category_name?: string;
  product_name?: string;
  user_id?: number;
}

export interface ReportOptions {
  module: 'ventas' | 'productos' | 'clientes' | 'reseñas';
  format: 'excel' | 'pdf' | 'json';
  group_by?: 'category' | 'brand' | 'product' | 'user' | 'mes' | null; // ✅ Inglés (backend)
  filters?: ReportFilters;
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
}

export interface ReportRequestNatural {
  prompt: string;
}

export interface ReportRequestStructured {
  options: ReportOptions;
}

export type ReportRequest = ReportRequestNatural | ReportRequestStructured;

export interface ReportHistoryItem {
  id: string;
  timestamp: string;
  mode: 'natural' | 'structured';
  request: ReportRequest;
  filename: string;
  success: boolean;
}
