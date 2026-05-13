import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth';
import type { Role } from '../models/roles';
import { authStorage } from '../lib/client';
import { loginUser, registerUser } from '../services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toUser = (auth: AuthResponse): User => {
    const userId = getUserIdFromToken(auth.token);
    return {
      id: userId,
      name: auth.nome,
      email: auth.email,
      role: auth.role,
      token: auth.token,
    };
  };

  useEffect(() => {
    const stored = authStorage.getData();
    if (stored?.token) {
      setUser(toUser(stored));
    }
    setIsLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const payload: RegisterRequest = { nome: name, email, password };
      const response = await registerUser(payload);
      setUser(toUser(response));
      return true;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const payload: LoginRequest = { email, password };
      const response = await loginUser(payload);
      setUser(toUser(response));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    authStorage.remove();
  };

  const getUserIdFromToken = (token: string) => {
    const payload = decodeJwt(token);
    return payload?.sub || payload?.nameidentifier || '';
  };

  const decodeJwt = (token: string): Record<string, string> | null => {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
