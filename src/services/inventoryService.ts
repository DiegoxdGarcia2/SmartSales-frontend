import api from 'src/utils/api';

// ========================================
// TYPES
// ========================================

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
}

// ========================================
// INVENTORY SERVICE
// ========================================

class InventoryService {
  /**
   * Obtener lista de productos del inventario
   */
  async getProducts(params?: {
    search?: string;
    category?: number;
    brand?: number;
    page?: number;
    pageSize?: number;
  }): Promise<Product[]> {
    try {
      const response = await api.get('/products/', {
        params: {
          search: params?.search,
          category: params?.category,
          brand: params?.brand,
          page: params?.page || 1,
          page_size: params?.pageSize || 100,
        },
      });

      // El backend puede devolver array directo o objeto paginado
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.results) {
        return response.data.results;
      }

      return [];
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  /**
   * Obtener un producto por ID
   */
  async getProduct(id: number): Promise<Product | null> {
    try {
      const response = await api.get(`/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      return null;
    }
  }
}

export default new InventoryService();
