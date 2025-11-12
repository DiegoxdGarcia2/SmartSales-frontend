// ========================================
// TIPOS DE OFERTAS
// ========================================

export type OfferType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';

export interface OfferCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  offer_type: OfferType;
  discount_value: number;
  min_purchase_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_featured: boolean;
  max_uses: number | null;
  max_uses_per_user: number;
  current_usage_count: number;
  applicable_products: number[];
  applicable_categories: number[];
  applicable_brands: number[];
  category: OfferCategory;
  created_by: number;
  ml_confidence_score: number | null;
  image_url?: string;
  terms_and_conditions?: string;
}

export interface PersonalizedOffer extends Offer {
  recommendation_reason?: string;
  user_match_score?: number;
}

export interface OfferApplication {
  offer_id: number;
  offer_name: string;
  original_total: number;
  total_discount: number;
  final_total: number;
  items: OfferApplicationItem[];
}

export interface OfferApplicationItem {
  product_id: number;
  product_name: string;
  quantity: number;
  original_price: number;
  discount_percentage: number;
  discount_amount: number;
  final_price: number;
}

export interface PaginatedOffers {
  count: number;
  next: string | null;
  previous: string | null;
  results: Offer[];
}

// Mapa de íconos para cada tipo de oferta
export const OFFER_TYPE_ICONS: Record<OfferType, string> = {
  percentage: 'solar:percent-bold',
  fixed_amount: 'solar:dollar-bold',
  buy_x_get_y: 'solar:gift-bold',
  free_shipping: 'solar:delivery-bold',
};

// Colores para badges de ofertas
export const OFFER_BADGE_COLORS = {
  active: '#e53935',
  featured: '#ffd700',
  expiring: '#ff5722',
  ml_recommended: '#1976d2',
};

// Tiempo en horas para considerar una oferta "por expirar"
export const OFFER_EXPIRING_THRESHOLD_HOURS = 24;
