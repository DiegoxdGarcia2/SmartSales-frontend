// Interfaz para Marca
export interface Brand {
  id: number;
  name: string;
  description?: string;
  warranty_info?: string;
  warranty_duration_months?: number | null;
}
