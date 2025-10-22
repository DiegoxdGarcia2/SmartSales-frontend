// Interfaz para el rol de usuario
export interface Role {
  id: number;
  name: string;
}

// Interfaz para el usuario (respuesta del API)
export interface User {
  id: number;
  username: string;
  email: string;
  role: Role; // Objeto anidado para respuestas del API
  first_name?: string;
  last_name?: string;
}

// Interfaz para el token JWT decodificado
export interface DecodedToken {
  user_id: string;
  username: string;
  email: string;
  role_id: number;
  role_name: string;
  exp: number;
  iat?: number;
  jti?: string;
  token_type?: string;
}

// Interfaz para el usuario autenticado (desde el token)
export interface AuthUser {
  user_id: string;
  username: string;
  email: string;
  role_id: number;
  role_name: string;
  exp: number;
}
