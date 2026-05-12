import { axiosClient } from './api.js';

export const getMenus = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.restaurantId) queryParams.append('restaurantId', params.restaurantId);

  const queryString = queryParams.toString();
  return axiosClient.get(`/menu/get${queryString ? `?${queryString}` : ''}`);
};

export const getMenuById = async (id) => {
  return axiosClient.get(`/menu/${id}`);
};

export const createMenu = async (formData) => {
  return axiosClient.post('/menu/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateMenu = async (id, formData) => {
  return axiosClient.put(`/menu/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteMenu = async (id) => {
  return axiosClient.put(`/menu/${id}/deactivate`, {});
};

export const activateMenu = async (id) => {
  return axiosClient.put(`/menu/${id}/activate`, {});
};

export const deactivateMenu = async (id) => {
  return axiosClient.put(`/menu/${id}/deactivate`, {});
};
