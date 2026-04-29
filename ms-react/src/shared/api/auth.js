import axios from 'axios';

const authBaseURL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3007/api/v1';

const authClient = axios.create({
  baseURL: authBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (data) => {
  return authClient.post('/auth/register', data);
};

export const verifyEmail = async (data) => {
  return authClient.post('/auth/verify-email', data);
};

export const login = async (data) => {
  return authClient.post('/auth/login', data);
};

export const forgotPassword = async (data) => {
  return authClient.post('/auth/forgot-password', data);
};

export const resetPassword = async (data) => {
  return authClient.post('/auth/reset-password', data);
};