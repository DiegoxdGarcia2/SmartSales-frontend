import type { Product } from './product';

export interface CartItem {
  id: number; // ID del CartItem en la BD
  product: Product; // Objeto anidado del producto
  quantity: number;
  discount_percentage: number; // Descuento aplicado (0-100)
  item_price: string; // Precio final CON descuento
  base_price: string; // Precio original SIN descuento
  discount_amount: string; // Monto del descuento en dinero
}

export interface Cart {
  id?: number; // ID del Cart en la BD (puede ser null si aún no existe)
  items: CartItem[];
  total_price?: string; // Calculado por el backend
  items_count?: number; // Contador de items
}
