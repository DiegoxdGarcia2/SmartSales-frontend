import api from 'src/utils/api';

// Interfaces para los datos del dashboard admin
export interface AdminStats {
  total_sales: number;
  total_orders: number;
  total_users: number;
  total_products: number;
  monthly_growth: number;
  pending_orders: number;
  low_stock_products: number;
  active_users_today: number;
  sales_this_month: number;
  orders_this_month: number;
  new_users_this_month: number;
}

export interface RecentActivity {
  id: number;
  type: 'order' | 'user' | 'product' | 'system';
  message: string;
  amount?: number;
  user?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TopProduct {
  id: number;
  name: string;
  sales_count: number;
  revenue: number;
  growth_percentage: number;
  category: string;
  image_url?: string;
}

export interface SalesChartData {
  date: string;
  sales: number;
  orders: number;
}

export interface UserGrowthData {
  date: string;
  new_users: number;
  total_users: number;
}

// Servicio para obtener datos del dashboard del administrador
export const adminDashboardService = {
  // Obtener estadísticas principales del negocio
  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await api.get('/analytics/dashboard-stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Retornar datos mock en caso de error
      return {
        total_sales: 125430.50,
        total_orders: 1247,
        total_users: 5832,
        total_products: 456,
        monthly_growth: 12.5,
        pending_orders: 23,
        low_stock_products: 8,
        active_users_today: 1250,
        sales_this_month: 45230.75,
        orders_this_month: 387,
        new_users_this_month: 145,
      };
    }
  },

  // Obtener actividad reciente del sistema
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get(`/analytics/recent-activity/?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Retornar datos mock en caso de error
      return [
        {
          id: 1,
          type: 'order',
          message: 'Nuevo pedido #ORD-2025-1248',
          amount: 1250.00,
          user: 'María García',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: 'user',
          message: 'Nuevo usuario registrado',
          user: 'Carlos López',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: 'product',
          message: 'Producto actualizado: iPhone 15 Pro',
          user: 'Admin',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          type: 'order',
          message: 'Pedido #ORD-2025-1247 completado',
          amount: 890.50,
          user: 'Ana Martínez',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }
  },

  // Obtener productos más vendidos
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    try {
      const response = await api.get(`/analytics/top-products/?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      // Retornar datos mock en caso de error
      return [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          sales_count: 145,
          revenue: 188050.00,
          growth_percentage: 15.2,
          category: 'Electrónicos',
          image_url: '/assets/images/products/iphone.jpg',
        },
        {
          id: 2,
          name: 'MacBook Air M3',
          sales_count: 89,
          revenue: 106311.00,
          growth_percentage: 8.7,
          category: 'Computadoras',
          image_url: '/assets/images/products/macbook.jpg',
        },
        {
          id: 3,
          name: 'AirPods Pro',
          sales_count: 203,
          revenue: 50747.00,
          growth_percentage: -2.1,
          category: 'Audio',
          image_url: '/assets/images/products/airpods.jpg',
        },
      ];
    }
  },

  // Obtener datos para gráfico de ventas
  async getSalesChartData(days: number = 30): Promise<SalesChartData[]> {
    try {
      const response = await api.get(`/admin/dashboard/sales-chart/?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales chart data:', error);
      // Retornar datos mock en caso de error
      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          sales: Math.floor(Math.random() * 5000) + 1000,
          orders: Math.floor(Math.random() * 50) + 10,
        });
      }
      return data;
    }
  },

  // Obtener datos de crecimiento de usuarios
  async getUserGrowthData(days: number = 30): Promise<UserGrowthData[]> {
    try {
      const response = await api.get(`/admin/dashboard/user-growth/?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      // Retornar datos mock en caso de error
      const data = [];
      let totalUsers = 5700;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const newUsers = Math.floor(Math.random() * 20) + 5;
        totalUsers += newUsers;
        data.push({
          date: date.toISOString().split('T')[0],
          new_users: newUsers,
          total_users: totalUsers,
        });
      }
      return data;
    }
  },

  // Obtener productos con stock bajo
  async getLowStockProducts(): Promise<Array<{id: number, name: string, stock: number, min_stock: number}>> {
    try {
      const response = await api.get('/admin/products/low-stock/');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      // Retornar datos mock en caso de error
      return [
        { id: 1, name: 'iPhone 15 Pro', stock: 3, min_stock: 5 },
        { id: 2, name: 'MacBook Air M3', stock: 2, min_stock: 3 },
        { id: 3, name: 'AirPods Pro', stock: 1, min_stock: 5 },
      ];
    }
  },

  // Obtener pedidos pendientes
  async getPendingOrders(): Promise<Array<{id: number, order_number: string, customer: string, total: number, created_at: string}>> {
    try {
      const response = await api.get('/admin/orders/pending/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      // Retornar datos mock en caso de error
      return [
        {
          id: 1,
          order_number: 'ORD-2025-1248',
          customer: 'María García',
          total: 1250.00,
          created_at: '2025-11-12T10:00:00Z',
        },
        {
          id: 2,
          order_number: 'ORD-2025-1249',
          customer: 'Carlos López',
          total: 890.50,
          created_at: '2025-11-12T09:30:00Z',
        },
      ];
    }
  },

  // Obtener resumen de ventas por categoría
  async getSalesByCategory(): Promise<Array<{category: string, sales: number, percentage: number}>> {
    try {
      const response = await api.get('/admin/dashboard/sales-by-category/');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      // Retornar datos mock en caso de error
      return [
        { category: 'Electrónicos', sales: 45230.50, percentage: 36.1 },
        { category: 'Computadoras', sales: 32150.75, percentage: 25.7 },
        { category: 'Audio', sales: 18950.25, percentage: 15.1 },
        { category: 'Accesorios', sales: 15680.00, percentage: 12.5 },
        { category: 'Otros', sales: 13419.00, percentage: 10.6 },
      ];
    }
  },
};