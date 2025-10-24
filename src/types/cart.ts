import type { Product } from './product';

export interface CartItem {
  id: number; // ID del CartItem en la BD
  product: Product; // Objeto anidado del producto
  quantity: number;
  item_price?: string; // Podría venir del serializer
}

export interface Cart {
  id?: number; // ID del Cart en la BD (puede ser null si aún no existe)
  items: CartItem[];
  total_price?: string; // Calculado por el backend
}
