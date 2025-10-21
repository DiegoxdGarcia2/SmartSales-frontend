import type { ReactNode } from 'react';

import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect, useContext, createContext } from 'react';

import api from '../utils/api';

// Tipos TypeScript
interface User {
  user_id: number;
  username: string;
  role: string;
  email: string;
  exp: number;
}

interface Tokens {
  access: string | null;
  refresh: string | null;
}

interface AuthContextType {
  user: User | null;
  tokens: Tokens;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (username: string, email: string, password: string, password2: string, role: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface DecodedToken {
  user_id: number;
  username?: string;
  role: string;
  email: string;
  exp: number;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens>({ access: null, refresh: null });
  const [loading, setLoading] = useState(true);

  // Función para cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');

        if (accessToken && refreshToken && userData) {
          // Verificar si el token no ha expirado
          const decodedToken = jwtDecode<DecodedToken>(accessToken);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            setTokens({ access: accessToken, refresh: refreshToken });
            setUser(JSON.parse(userData));
          } else {
            // Token expirado, limpiar
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario desde localStorage:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Función para limpiar datos de autenticación
  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setTokens({ access: null, refresh: null });
  };

  // Función de login
  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // Decodificar el token para obtener datos del usuario
      const decodedToken = jwtDecode<DecodedToken>(access);
      
      // Crear objeto de usuario con los datos del token
      const userData: User = {
        user_id: decodedToken.user_id,
        username: decodedToken.username || username,
        role: decodedToken.role,
        email: decodedToken.email,
        exp: decodedToken.exp,
      };

      // Guardar en localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      // Actualizar estado
      setTokens({ access, refresh });
      setUser(userData);

      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Error en login:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error de autenticación';
      return { success: false, error: errorMessage };
    }
  };

  // Función de registro
  const register = async (username: string, email: string, password: string, password2: string, role: string) => {
    try {
      const response = await api.post('/users/register/', {
        username,
        email,
        password,
        password2,
        role,
      });

      // Si el registro es exitoso, hacer login automático
      if (response.data) {
        const loginResult = await login(username, password);
        return loginResult;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error en registro:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          error.response?.data || 
                          'Error en el registro';
      
      // Si es un objeto con errores de campo, formatear el mensaje
      if (typeof errorMessage === 'object') {
        const errors = Object.entries(errorMessage)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        return { success: false, error: errors };
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Función de logout
  const logout = () => {
    clearAuthData();
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = (): boolean => !!user && !!tokens.access;

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role: string): boolean => user?.role === role;

  const value: AuthContextType = {
    user,
    tokens,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;