import { axiosClient } from './api.js';

const authBaseURL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3007/api/v1';

export const getUsers = async () => axiosClient.get(`${authBaseURL}/users`);

export const getUserById = async (userId) => axiosClient.get(`${authBaseURL}/users/${userId}`);

export const updateUserRole = async (userId, role) =>
  axiosClient.patch(`${authBaseURL}/users/${userId}/role`, { role });

export const createUser = async (userData) =>
  axiosClient.post(`${authBaseURL}/users`, userData);
