// Tipos para Analytics y Dashboard de Ventas

export interface MonthlySales {
  month: string; // Formato 'YYYY-MM'
  total_sales: number;
}

export interface CategorySales {
  category: string;
  total_sales: number;
}

export interface SalesPrediction {
  month: string; // Formato 'YYYY-MM-DD' (o 'YYYY-MM' si se ajusta)
  predicted_sales: number;
}
