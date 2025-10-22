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
  category: number; // o Category si anidamos
  marca: string;
  garantia: string;
  // Asumimos que el serializer no envía created_at/updated_at
}
