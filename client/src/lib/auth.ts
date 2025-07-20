import { queryClient } from "./queryClient";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  condition?: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  queryClient.clear();
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
