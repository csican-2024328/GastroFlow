import { axiosClient } from './api.js';

const authBaseURL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3007/api/v1';

export const getUsers = async () => {
  return axiosClient.get(`${authBaseURL}/users`);
};
