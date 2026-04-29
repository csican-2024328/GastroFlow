import { axiosClient } from './api.js';

export const getUsers = async () => {
  return axiosClient.get('/users');
};
