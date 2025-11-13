import api from 'src/utils/api';

import offerService from './offerService';
import inventoryService from './inventoryService';

// Interfaces para los datos del dashboard cliente
export interface ClientOrder {
  id: number;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items_count: number;
}

export interface ClientOffer {
  id: number;
  title: string;
  description: string;
  discount_percentage: number;
  valid_until: string;
  image_url?: string;
}

export interface ClientRecommendation {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  rating: number;
  category: string;
}

export interface ClientStats {
  total_orders: number;
  total_spent: number;
  favorite_products_count: number;
  active_offers_count: number;
}

// Servicio para obtener datos del dashboard del cliente
export const clientDashboardService = {
  // Obtener pedidos recientes del cliente
  async getRecentOrders(limit: number = 5): Promise<ClientOrder[]> {
    try {
      const response = await api.get('/orders/orders/', {
        params: {
          ordering: '-created_at',
          page_size: limit,
        },
      });

      // El backend puede devolver array directo o objeto paginado
      const orders = Array.isArray(response.data) ? response.data : response.data.results || [];

      // Si no hay pedidos del backend, mostrar datos de ejemplo
      if (orders.length === 0) {
        console.log('No orders from backend, showing sample data');
        return [
          {
            id: 1,
            order_number: 'ORD-2025-0001',
            status: 'Entregado',
            total: 1250.00,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
            items_count: 3,
          },
          {
            id: 2,
            order_number: 'ORD-2025-0002',
            status: 'En proceso',
            total: 890.50,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
            items_count: 2,
          },
          {
            id: 3,
            order_number: 'ORD-2025-0003',
            status: 'Pendiente',
            total: 450.75,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana atrás
            items_count: 1,
          },
        ];
      }

      // Transformar los datos para que coincidan con la interfaz
      return orders.map((order: any) => ({
        id: order.id,
        order_number: `ORD-${order.id.toString().padStart(4, '0')}`,
        status: order.status,
        total: parseFloat(order.total_price || '0'),
        created_at: order.created_at,
        items_count: order.items?.length || 0,
      }));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      // Mostrar datos de ejemplo cuando hay error de conexión
      return [
        {
          id: 1,
          order_number: 'ORD-2025-0001',
          status: 'Entregado',
          total: 1250.00,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          items_count: 3,
        },
        {
          id: 2,
          order_number: 'ORD-2025-0002',
          status: 'En proceso',
          total: 890.50,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          items_count: 2,
        },
        {
          id: 3,
          order_number: 'ORD-2025-0003',
          status: 'Pendiente',
          total: 450.75,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          items_count: 1,
        },
        {
          id: 4,
          order_number: 'ORD-2025-0004',
          status: 'Entregado',
          total: 2100.25,
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          items_count: 4,
        },
        {
          id: 5,
          order_number: 'ORD-2025-0005',
          status: 'Cancelado',
          total: 320.00,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          items_count: 1,
        },
      ];
    }
  },

  // Obtener ofertas disponibles para el cliente
  async getAvailableOffers(): Promise<ClientOffer[]> {
    try {
      const offers = await offerService.getActiveOffers();

      // Transformar las ofertas para que coincidan con la interfaz
      return offers.map((offer: any) => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        discount_percentage: offer.discount_percentage,
        valid_until: offer.end_date || offer.valid_until,
        image_url: offer.image_url,
      }));
    } catch (error) {
      console.error('Error fetching available offers:', error);
      // Retornar array vacío en lugar de datos mock
      return [];
    }
  },

  // Obtener recomendaciones personalizadas
  async getRecommendations(limit: number = 6): Promise<ClientRecommendation[]> {
    try {
      const products = await inventoryService.getProducts({
        pageSize: limit,
      });

      // Transformar los productos para que coincidan con la interfaz
      return products.slice(0, limit).map((product: any) => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price || '0'),
        image_url: product.image_url || product.image,
        rating: product.average_rating || 4.5,
        category: product.category?.name || 'General',
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Retornar array vacío en lugar de datos mock
      return [];
    }
  },

  // Obtener estadísticas del cliente
  async getClientStats(): Promise<ClientStats> {
    try {
      const response = await api.get('/users/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching client stats:', error);
      // Retornar datos mock en caso de error
      return {
        total_orders: 12,
        total_spent: 3450.75,
        favorite_products_count: 8,
        active_offers_count: 3,
      };
    }
  },

  // Marcar producto como favorito
  async toggleFavorite(productId: number): Promise<void> {
    try {
      await api.post(`/products/${productId}/favorite/`);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // Obtener productos favoritos
  async getFavoriteProducts(): Promise<ClientRecommendation[]> {
    try {
      const response = await api.get('/products/favorites/');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorite products:', error);
      return [];
    }
  },
};