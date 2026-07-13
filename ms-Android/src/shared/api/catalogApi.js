import apiClient from './apiClient';

export const getPlatos = (params = {}) => {
  return apiClient.get('/platos/get', { params });
};

export const getMenus = (params = {}) => {
  return apiClient.get('/menu/get', { params });
};
