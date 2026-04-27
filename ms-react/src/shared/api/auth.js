import { axiosClient } from './api.js';

export const login = async (data) => {
  return axiosClient.post('/auth/login', data);
};