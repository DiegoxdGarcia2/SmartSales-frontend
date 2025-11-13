import type { ReactNode } from 'react';
import type { AuthUser, DecodedToken } from 'src/types/user';

import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect, useContext, createContext } from 'react';

import api from '../utils/api';

// Tipos TypeScript
interface Tokens {
  access: string | null;
  refresh: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  tokens: Tokens;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  register: (username: string, email: string, password: string, password2: string, roleId: number) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (roleName: string) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
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
  const [user, setUser] = useState<AuthUser | null>(null);
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
      
      // DEBUG: Ver qué viene en el token
      console.log('🔍 Token decodificado:', decodedToken);
      console.log('🔍 role_id:', decodedToken.role_id, 'role_name:', decodedToken.role_name);
      
      // Crear objeto de usuario con los datos del token
      const userData: AuthUser = {
        user_id: decodedToken.user_id,
        username: decodedToken.username,
        email: decodedToken.email,
        role_id: decodedToken.role_id,
        role_name: decodedToken.role_name,
        exp: decodedToken.exp,
      };

      console.log('🔍 UserData final:', userData);

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
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Error de autenticación';
      return { success: false, error: errorMessage };
    }
  };

  // Función de registro
  const register = async (username: string, email: string, password: string, password2: string, roleId: number) => {
    try {
      const response = await api.post('/users/register/', {
        username,
        email,
        password,
        password2,
        role_id: roleId, // Ahora enviamos role_id en lugar de role
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
  const hasRole = (roleName: string): boolean => {
    if (!user?.role_name) return false;

    // Comparar de manera case-insensitive y manejar variaciones comunes
    const userRole = user.role_name.toLowerCase();
    const targetRole = roleName.toLowerCase();

    // Mapeo de roles equivalentes
    const roleMappings: Record<string, string[]> = {
      'admin': ['admin', 'administrator', 'administrador', 'adm'],
      'user': ['user', 'usuario', 'client', 'cliente'],
    };

    // Verificar si el rol del usuario está en el mapeo del rol objetivo
    if (roleMappings[targetRole]?.includes(userRole)) {
      return true;
    }

    // Comparación directa como fallback
    return userRole === targetRole;
  };

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