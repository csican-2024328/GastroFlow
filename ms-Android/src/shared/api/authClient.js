import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints';

const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
