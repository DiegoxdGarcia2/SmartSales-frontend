import api from '../utils/api';

import type {
  Offer,
  OfferCategory,
  PaginatedOffers,
  OfferApplication,
  PersonalizedOffer,
} from '../types/offer';

// ========================================
// OFFER SERVICE
// ========================================

class OfferService {
  // ==================== OFERTAS PÚBLICAS ====================

  /**
   * Obtener todas las ofertas (paginado)
   */
  async getOffers(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    offerType?: string;
    isFeatured?: boolean;
    ordering?: string;
  }): Promise<PaginatedOffers> {
    console.log('🔵 offerService.getOffers - Params:', params);
    
    const response = await api.get('/offers/offers/', {
      params: {
        page: params?.page || 1,
        page_size: params?.pageSize || 20,
        category: params?.category,
        offer_type: params?.offerType,
        is_featured: params?.isFeatured,
        ordering: params?.ordering || '-created_at',
      },
    });
    
    console.log('🔵 offerService.getOffers - Response:', response);
    console.log('🔵 offerService.getOffers - Response.data:', response.data);
    console.log('🔵 offerService.getOffers - Type:', typeof response.data);
    
    return response.data;
  }

  /**
   * Obtener solo ofertas activas
   */
  async getActiveOffers(): Promise<Offer[]> {
    const response = await api.get('/offers/offers/active/');
    return response.data;
  }

  /**
   * Obtener solo ofertas destacadas
   */
  async getFeaturedOffers(): Promise<Offer[]> {
    const response = await api.get('/offers/offers/featured/');
    return response.data;
  }

  /**
   * Obtener detalle de una oferta
   */
  async getOffer(id: number): Promise<Offer> {
    const response = await api.get(`/offers/offers/${id}/`);
    return response.data;
  }

  // ==================== OFERTAS PERSONALIZADAS ====================

  /**
   * Obtener ofertas personalizadas basadas en ML
   * Requiere autenticación
   */
  async getPersonalizedOffers(): Promise<PersonalizedOffer[]> {
    const response = await api.get('/offers/offers/personalized/');
    return response.data;
  }

  /**
   * Aplicar oferta al carrito (reclamar oferta)
   * Requiere autenticación
   * @param offerId - ID de la oferta
   * @param productIds - IDs de productos para aplicar la oferta
   * @param cartTotal - Total del carrito
   */
  async applyOfferToCart(
    offerId: number,
    cartTotal: number,
    productIds: number[]
  ): Promise<OfferApplication> {
    const response = await api.post('/offers/offers/apply_to_cart/', {
      offer_id: offerId,
      cart_total: cartTotal,
      product_ids: productIds,
    });
    return response.data;
  }

  // ==================== CATEGORÍAS ====================

  /**
   * Obtener todas las categorías de ofertas
   */
  async getCategories(): Promise<OfferCategory[]> {
    const response = await api.get('/offers/categories/');
    return response.data;
  }

  /**
   * Obtener ofertas de una categoría específica
   */
  async getOffersByCategory(categoryId: number): Promise<Offer[]> {
    const response = await api.get(`/offers/categories/${categoryId}/`);
    return response.data;
  }

  // ==================== HELPERS ====================

  /**
   * Verificar si una oferta está activa y válida
   */
  isOfferValid(offer: Offer): boolean {
    // Si no hay fechas, considerar válida solo si está ACTIVE
    if (!offer.start_date || !offer.end_date) {
      return offer.status === 'ACTIVE';
    }

    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);

    // Añadir margen de 1 día para compensar zonas horarias
    const oneDayMs = 24 * 60 * 60 * 1000;
    const isAfterStart = now.getTime() >= (startDate.getTime() - oneDayMs);
    const isBeforeEnd = now.getTime() <= (endDate.getTime() + oneDayMs);

    return (
      offer.status === 'ACTIVE' &&
      isAfterStart &&
      isBeforeEnd &&
      (offer.max_uses === null || offer.max_uses === undefined || offer.conversions_count < offer.max_uses)
    );
  }

  /**
   * Calcular horas restantes hasta que expire la oferta
   */
  getHoursRemaining(offer: Offer): number {
    if (offer.time_remaining_hours !== undefined) {
      return offer.time_remaining_hours;
    }
    const now = new Date();
    const endDate = new Date(offer.end_date);
    const diff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }

  /**
   * Verificar si la oferta está por expirar (menos de 24 horas)
   */
  isOfferExpiringSoon(offer: Offer): boolean {
    return this.getHoursRemaining(offer) < 24;
  }

  /**
   * Formatear el descuento para mostrar
   */
  formatDiscount(offer: Offer): string {
    return `${offer.discount_percentage}% OFF`;
  }

  /**
   * Verificar si la oferta es destacada (featured)
   */
  isFeatured(offer: Offer): boolean {
    return offer.priority >= 5;
  }

  // ==================== TRACKING ====================

  /**
   * Registrar vista de oferta
   */
  async trackView(id: number): Promise<void> {
    try {
      await api.get(`/offers/offers/${id}/track_view/`);
    } catch (error) {
      console.warn('Error tracking offer view:', error);
    }
  }

  /**
   * Registrar click en oferta
   */
  async trackClick(id: number): Promise<void> {
    try {
      await api.post(`/offers/offers/${id}/track_click/`);
    } catch (error) {
      console.warn('Error tracking offer click:', error);
    }
  }

  // ==================== ESTADÍSTICAS (ADMIN) ====================

  /**
   * Obtener estadísticas de ofertas
   */
  async getStats(): Promise<any> {
    const response = await api.get('/offers/offers/stats/');
    return response.data;
  }

  // ==================== CRUD ADMIN ====================

  /**
   * Crear nueva oferta (requiere auth admin)
   */
  async createOffer(offerData: Partial<Offer>): Promise<Offer> {
    console.log('🔵 offerService.createOffer - Recibido:', offerData);
    console.log('🔵 product_ids presente?', 'product_ids' in offerData);
    console.log('🔵 Valor de product_ids:', (offerData as any).product_ids);
    
    const response = await api.post('/offers/offers/', offerData);
    return response.data;
  }

  /**
   * Actualizar oferta existente (requiere auth admin)
   */
  async updateOffer(id: number, offerData: Partial<Offer>): Promise<Offer> {
    const response = await api.put(`/offers/offers/${id}/`, offerData);
    return response.data;
  }

  /**
   * Actualizar parcialmente una oferta (requiere auth admin)
   */
  async patchOffer(id: number, offerData: Partial<Offer>): Promise<Offer> {
    const response = await api.patch(`/offers/offers/${id}/`, offerData);
    return response.data;
  }

  /**
   * Eliminar oferta (requiere auth admin)
   */
  async deleteOffer(id: number): Promise<void> {
    await api.delete(`/offers/offers/${id}/`);
  }

  /**
   * Activar oferta (requiere auth admin)
   */
  async activateOffer(id: number, notifyUsers: boolean = true): Promise<any> {
    const response = await api.post(`/offers/offers/${id}/activate/`, {
      notify_users: notifyUsers,
    });
    return response.data;
  }

  /**
   * Desactivar oferta (requiere auth admin)
   */
  async deactivateOffer(id: number): Promise<any> {
    const response = await api.post(`/offers/offers/${id}/deactivate/`);
    return response.data;
  }
}

export default new OfferService();
