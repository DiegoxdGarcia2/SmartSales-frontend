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
   * Reclamar oferta (vincular al usuario)
   * Requiere autenticación
   */
  async claimOffer(id: number): Promise<Offer> {
    const response = await api.post(`/offers/offers/${id}/claim/`);
    return response.data;
  }

  /**
   * Canjear oferta en una orden
   * Requiere autenticación
   */
  async redeemOffer(id: number, orderId: number): Promise<any> {
    const response = await api.post(`/offers/offers/${id}/redeem/`, {
      order_id: orderId,
    });
    return response.data;
  }

  /**
   * Aplicar oferta a un carrito (calcular descuento)
   */
  async applyOfferToCart(
    offerId: number,
    cartTotal: number,
    productIds: number[]
  ): Promise<OfferApplication> {
    const response = await api.post('/offers/offers/apply-to-cart/', {
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
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);

    return (
      offer.is_active &&
      now >= startDate &&
      now <= endDate &&
      (offer.max_uses === null || offer.current_usage_count < offer.max_uses)
    );
  }

  /**
   * Calcular horas restantes hasta que expire la oferta
   */
  getHoursRemaining(offer: Offer): number {
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
    switch (offer.offer_type) {
      case 'percentage':
        return `${offer.discount_value}% OFF`;
      case 'fixed_amount':
        return `$${offer.discount_value} OFF`;
      case 'buy_x_get_y':
        return 'Compra X Lleva Y';
      case 'free_shipping':
        return 'Envío Gratis';
      default:
        return '';
    }
  }

  // ==================== CRUD ADMIN ====================

  /**
   * Crear nueva oferta (requiere auth admin)
   */
  async createOffer(offerData: Partial<Offer>): Promise<Offer> {
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
  async activateOffer(id: number): Promise<Offer> {
    const response = await api.post(`/offers/offers/${id}/activate/`);
    return response.data;
  }

  /**
   * Desactivar oferta (requiere auth admin)
   */
  async deactivateOffer(id: number): Promise<Offer> {
    const response = await api.post(`/offers/offers/${id}/deactivate/`);
    return response.data;
  }
}

export default new OfferService();
