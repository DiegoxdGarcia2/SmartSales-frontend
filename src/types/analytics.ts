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

export interface KpiData {
  total_customers: number;
  total_orders_paid: number;
  average_order_value: number;
  total_revenue: number;
  recent_orders_count: number;
  top_selling_products: {
    product_name: string;
    total_sold: number;
  }[];
}
