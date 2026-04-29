import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3007/api/v1';

export const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
  // Do not set a global Content-Type header here. For JSON requests axios will
  // set 'application/json' automatically. For FormData (file uploads) we must
  // let the browser/axios set the multipart boundary.
});

axiosClient.interceptors.request.use(async (config) => {
  const authState = useAuthStore.getState();
  const token = authState.ensureFreshToken
    ? await authState.ensureFreshToken()
    : authState.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      useAuthStore.getState().token
    ) {
      originalRequest._retry = true;

      const nextToken = useAuthStore.getState().refreshSession
        ? await useAuthStore.getState().refreshSession()
        : null;

      if (nextToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return axiosClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);