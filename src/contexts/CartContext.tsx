import type { ReactNode } from 'react';
import type { Cart, CartItem } from 'src/types/cart';

import React, { useState, useEffect, useContext, useCallback, createContext } from 'react';

import api from 'src/utils/api';

import { useAuth } from 'src/auth/AuthContext';

// ----------------------------------------------------------------------

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCartLocally: () => void; // Para vaciar después de crear orden
}

interface CartProviderProps {
  children: ReactNode;
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// Provider del contexto
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Función para obtener el carrito
  const fetchCart = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🛒 Cargando carrito desde /cart/');
      const response = await api.get<Cart>('/cart/');
      console.log('✅ Carrito cargado:', response.data);
      setCart(response.data);
    } catch (err: any) {
      console.error('❌ Error al cargar carrito:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Error al cargar el carrito';
      setError(errorMessage);
      // Si el carrito no existe aún, inicializar vacío
      if (err.response?.status === 404) {
        setCart({ items: [] });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Función para agregar producto al carrito
  const addToCart = useCallback(async (productId: number, quantity: number) => {
    if (!user) {
      console.warn('⚠️ Usuario no autenticado');
      setError('Debes iniciar sesión para agregar al carrito');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('➕ Agregando al carrito:', { product_id: productId, quantity });
      
      const response = await api.post<CartItem>('/cart/', { 
        product_id: productId, 
        quantity 
      });
      
      console.log('✅ Producto agregado:', response.data);
      
      // Refrescar el carrito completo
      await fetchCart();
    } catch (err: any) {
      console.error('❌ Error al agregar al carrito:', err);
      
      // Capturar mensaje de error específico del backend
      let errorMessage = 'Error al agregar al carrito';
      
      if (err.response?.data) {
        // Priorizar el campo 'error' que envía el backend para mensajes específicos de stock
        errorMessage = err.response.data.error || 
                      err.response.data.detail || 
                      err.response.data.message ||
                      errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('📝 Mensaje de error:', errorMessage);
      setError(errorMessage);
      
      // Re-lanzar el error con el mensaje específico para que el componente lo muestre
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = err.response;
      throw enhancedError;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCart]);

  // Función para actualizar cantidad de un item
  const updateCartItem = useCallback(async (itemId: number, quantity: number) => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const requestBody = { item_id: itemId, quantity };
      console.log('✏️ PUT /api/cart/ - Body:', requestBody);
      
      await api.put<CartItem>('/cart/', requestBody);
      
      console.log('✅ Item actualizado');
      
      // Refrescar el carrito completo
      await fetchCart();
    } catch (err: any) {
      console.error('❌ Error al actualizar item:', err);
      console.error('❌ Detalles del error:', {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
      });
      
      // Capturar mensaje de error específico del backend
      let errorMessage = 'Error al actualizar el item';
      
      if (err.response?.data) {
        errorMessage = err.response.data.error || 
                      err.response.data.detail || 
                      err.response.data.message ||
                      errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('📝 Mensaje de error:', errorMessage);
      setError(errorMessage);
      
      // Re-lanzar el error con el mensaje específico
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).response = err.response;
      throw enhancedError;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCart]);

  // Función para eliminar un item del carrito
  const removeFromCart = useCallback(async (itemId: number) => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const requestBody = { item_id: itemId };
      console.log('🗑️ DELETE /api/cart/ - Body:', requestBody);
      
      await api.delete('/cart/', { data: requestBody });
      
      console.log('✅ Item eliminado');
      
      // Refrescar el carrito completo
      await fetchCart();
    } catch (err: any) {
      console.error('❌ Error al eliminar item:', err);
      console.error('❌ Detalles del error:', {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
      });
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Error al eliminar el item';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCart]);

  // Función para limpiar el carrito localmente (después de crear orden)
  const clearCartLocally = useCallback(() => {
    console.log('🧹 Limpiando carrito localmente');
    setCart({ items: [] });
  }, []);

  // Cargar carrito cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Si no hay usuario, limpiar el carrito
      setCart(null);
    }
  }, [user, fetchCart]);

  const value: CartContextType = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCartLocally,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
