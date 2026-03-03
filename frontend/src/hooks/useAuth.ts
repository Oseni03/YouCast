import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface AuthResponse {
  access: string;
  refresh: string;
  creator: {
    id: string;
    email: string;
    username: string;
    avatar_url: string;
  };
  is_new: boolean;
}

const storeTokens = (access: string, refresh: string) => {
  if (typeof window === 'undefined') return;
  // Store in localStorage for the Axios interceptor
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  // Store access_token in a cookie so Next.js middleware can read it
  document.cookie = `access_token=${access}; path=/; SameSite=Strict`;
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // Clear the cookie by setting an expired date
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post<AuthResponse>('/auth/login/', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      storeTokens(data.access, data.refresh);
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: async (userData: { email: string; password: string; username: string }) => {
      const response = await api.post<AuthResponse>('/auth/signup/', userData);
      return response.data;
    },
    onSuccess: (data) => {
      storeTokens(data.access, data.refresh);
    },
  });
};

