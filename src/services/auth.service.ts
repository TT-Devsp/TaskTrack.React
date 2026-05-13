import { http, authStorage } from '../lib/client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth';

/**
 * Realiza login do usuário
 * Rota final: /api/auth/login
 */
export async function loginUser(payload: LoginRequest): Promise<AuthResponse> {
  // Removido o '/api' do início da string
  const response = await http.post<AuthResponse, LoginRequest>('/auth/login', payload);
  authStorage.setData(response);
  return response;
}

/**
 * Registra um novo usuário
 * Rota final: /api/auth/register
 */
export async function registerUser(payload: RegisterRequest): Promise<AuthResponse> {
  // Removido o '/api' do início da string
  const response = await http.post<AuthResponse, RegisterRequest>('/auth/register', payload);
  authStorage.setData(response);
  return response;
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return !!authStorage.getToken();
}

/**
 * Faz logout
 */
export function logout(): void {
  authStorage.remove();
}

/**
 * Obtém dados do usuário logado
 */
export function getAuthData(): AuthResponse | null {
  return authStorage.getData();
}