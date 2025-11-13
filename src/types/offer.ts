// ========================================
// TIPOS DE OFERTAS - ALINEADO CON BACKEND
// ========================================

// Tipos de oferta del backend (categorías de oferta)
export type OfferType = 
  | 'FLASH_SALE'       // Venta Flash
  | 'DAILY_DEAL'       // Oferta del Día
  | 'SEASONAL'         // Oferta de Temporada
  | 'CLEARANCE'        // Liquidación
  | 'PERSONALIZED';    // Oferta Personalizada

// Estados de oferta del backend
export type OfferStatus =
  | 'DRAFT'      // Borrador
  | 'ACTIVE'     // Activa
  | 'PAUSED'     // Pausada
  | 'EXPIRED'    // Expirada
  | 'CANCELLED'; // Cancelada

export interface OfferCategory {
  id: number;
  name: string;
  slug: string;
  value: string;
}

export interface OfferProduct {
  id: number;
  offer: number;
  product: number | {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category?: number | OfferCategory;
    category_name?: string;
    brand?: number;
    image?: string;
  };
  product_name?: string;
  discount_percentage?: number;
  created_at: string;
}

export interface Offer {
  id: number;
  name: string;  // Backend usa "name", no "title"
  description: string;
  offer_type: OfferType;
  discount_percentage: number;  // Backend usa "discount_percentage", no "discount_value"
  start_date: string;
  end_date: string;
  status: OfferStatus;  // Backend usa "status" (enum), no "is_active" (boolean)
  max_uses: number | null;
  max_uses_per_user: number;
  min_purchase_amount: number;
  target_user: number | null;
  target_user_name?: string;
  priority: number;  // Backend usa "priority" (número), no "is_featured" (boolean). priority >= 5 = featured
  
  // Estadísticas (read-only desde backend)
  views_count: number;
  clicks_count: number;
  conversions_count: number;
  conversion_rate?: number;
  is_active?: boolean;  // Calculado por backend (status + fechas)
  time_remaining_hours?: number;  // Calculado por backend
  
  // Metadata
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  
  // Productos asociados
  offer_products?: OfferProduct[];
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
  FLASH_SALE: 'solar:fire-bold',
  DAILY_DEAL: 'solar:star-bold',
  SEASONAL: 'solar:calendar-bold',
  CLEARANCE: 'solar:tag-price-bold',
  PERSONALIZED: 'solar:user-heart-bold',
};

// Labels amigables para tipos de oferta
export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  FLASH_SALE: 'Venta Flash',
  DAILY_DEAL: 'Oferta del Día',
  SEASONAL: 'Oferta de Temporada',
  CLEARANCE: 'Liquidación',
  PERSONALIZED: 'Oferta Personalizada',
};

// Labels amigables para estados
export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  PAUSED: 'Pausada',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
};

// Colores para badges de estados
export const OFFER_STATUS_COLORS: Record<OfferStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  PAUSED: 'warning',
  EXPIRED: 'error',
  CANCELLED: 'error',
};

// Colores para badges de ofertas
export const OFFER_BADGE_COLORS = {
  active: '#4caf50',
  featured: '#ffd700',
  expiring: '#ff5722',
  ml_recommended: '#1976d2',
};

// Tiempo en horas para considerar una oferta "por expirar"
export const OFFER_EXPIRING_THRESHOLD_HOURS = 24;
