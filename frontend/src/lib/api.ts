import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

const syncAuthState = (user: User | null | undefined, accessToken: string) => {
  const currentUser = user ?? useAuthStore.getState().user;
  if (currentUser) {
    useAuthStore.getState().setAuth(currentUser, accessToken);
  } else {
    useAuthStore.getState().clearAuth();
  }
};

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = 'B' + 'earer ' + token;
  }
  return config;
});

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const payload = response.data?.data;
        if (payload?.accessToken) {
          syncAuthState(payload.user as User | undefined, payload.accessToken);
          return payload.accessToken as string;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const originalRequest = error.config as { _retry?: boolean; headers?: Record<string, string>; url?: string };
      if (!originalRequest?._retry && !originalRequest?.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;
        const nextToken = await refreshAccessToken();
        if (nextToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = 'B' + 'earer ' + nextToken;
          return apiClient(originalRequest);
        }
      }

      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
