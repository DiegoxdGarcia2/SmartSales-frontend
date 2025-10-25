import type { Brand } from './brand';
import type { Review } from './review';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: string; // Django DecimalField se serializa como string
  stock: number;
  category: number; // ID de categoría
  brand: number | Brand; // Puede venir como ID (al crear/editar) o como objeto anidado (al listar)
  image?: string | null; // URL de la imagen del producto (Cloudinary)
  image_url?: string; // URL de la imagen del producto (legacy)
  reviews?: Review[]; // Reseñas del producto
  average_rating?: number; // Rating promedio
  reviews_count?: number; // Número de reseñas
  // Removido: marca (string) y garantia (string)
}
