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

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: any) => {
      const response = await api.post<AuthResponse>('/auth/login/', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
      }
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post<AuthResponse>('/auth/signup/', userData);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
      }
    },
  });
};
