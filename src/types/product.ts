import type { Brand } from './brand';

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
  // Removido: marca (string) y garantia (string)
}
