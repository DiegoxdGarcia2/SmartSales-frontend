import type { ReactNode } from 'react';

import React, { useState, useEffect, useContext, createContext } from 'react';

import api from '../utils/api';

import type { Brand } from '../types/brand';
import type { Product, Category } from '../types/product';

// Tipos TypeScript
interface ProductContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
}

interface ProductProviderProps {
  children: ReactNode;
}

// Crear el contexto
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe ser usado dentro de un ProductProvider');
  }
  return context;
};

// Provider del contexto
export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (err: any) {
      console.error('Error al obtener productos:', err);
      setError(err.response?.data?.detail || 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener categorías
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (err: any) {
      console.error('❌ Error al obtener categorías:', err);
      setCategories([]);
    }
  };

  // Función para obtener marcas
  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands/');
      setBrands(response.data);
    } catch (err: any) {
      console.error('❌ Error al obtener marcas:', err);
      setBrands([]);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar productos, categorías y marcas en paralelo
        await Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const value: ProductContextType = {
    products,
    categories,
    brands,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    fetchBrands,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
