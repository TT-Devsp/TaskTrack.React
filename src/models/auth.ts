import type { Role } from './roles';

export interface AuthResponse {
  token: string;
  email: string;
  nome: string;
  role: Role;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nome: string;
}
