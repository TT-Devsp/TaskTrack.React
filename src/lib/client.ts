import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { Role } from '../models/roles';

// Em dev, use a API local diretamente se VITE_API_URL nao estiver definido.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const AUTH_STORAGE_KEY = 'auth';

export interface AuthData {
  token: string;
  email: string;
  nome: string;
  role: Role;
  expiresAt: string;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de Requisição: Adiciona o Bearer Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    
    if (authData) {
      try {
        const { token }: AuthData = JSON.parse(authData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Falha no parse do JSON, ignora
      }
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor de Resposta: Tratamento de erros globais
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Redireciona para login apenas se o erro 401 vier de rotas protegidas
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/')) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    api.get<T, AxiosResponse<T>>(url, config).then(res => res.data),
  
  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => 
    api.post<T, AxiosResponse<T>, D>(url, data, config).then(res => res.data),
  
  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => 
    api.put<T, AxiosResponse<T>, D>(url, data, config).then(res => res.data),
  
  patch: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => 
    api.patch<T, AxiosResponse<T>, D>(url, data, config).then(res => res.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    api.delete<T, AxiosResponse<T>>(url, config).then(res => res.data),
};

export const authStorage = {
  getData: (): AuthData | null => {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as AuthData;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },
  setData: (data: AuthData) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  },
  remove: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
  getToken: (): string | null => {
    return authStorage.getData()?.token || null;
  },
};

export { api };
export default api;