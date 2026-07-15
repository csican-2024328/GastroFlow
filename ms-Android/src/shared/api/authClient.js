import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints';
import { useAuthStore } from '../store/authStore';

const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
  timeout: 10000,
  // No fijar un Content-Type global: axios lo pone en 'application/json' solo
  // para bodies planos automáticamente, y deja que FormData (subida de avatar)
  // agregue su propio boundary multipart. Fijarlo aquí rompería esa subida.
});

authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => authClient.post('/auth/register', data);

export const login = (data) => authClient.post('/auth/login', data);

export const refreshToken = (token) =>
  authClient.post(
    '/auth/refresh-token',
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

export const forgotPassword = (data) => authClient.post('/auth/forgot-password', data);

export const resetPassword = (data) => authClient.post('/auth/reset-password', data);

export default authClient;
