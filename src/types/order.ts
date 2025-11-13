import type { Product } from './product';

export interface OrderItem {
  id: number;
  product: Product;
  product_name: string;
  quantity: number;
  price: string; // Django DecimalField se serializa como string
  discount_percentage?: number; // Descuento aplicado (0-100)
  item_price?: string; // Precio final CON descuento
  base_price?: string; // Precio original SIN descuento
  discount_amount?: string; // Monto del descuento en dinero
}

export interface Order {
  id: number;
  user: number; // ID del usuario
  status: string; // 'pending', 'processing', 'completed', 'cancelled'
  payment_status: string; // 'pending', 'paid', 'failed'
  total_price: string; // Django DecimalField
  created_at: string; // ISO timestamp
  updated_at: string;
  items: OrderItem[];
}
