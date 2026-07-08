import { axiosClient } from './api.js';

export const getDishes = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.restaurantId) queryParams.append('restaurantId', params.restaurantId);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.page) queryParams.append('page', params.page);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

  const queryString = queryParams.toString();
  return axiosClient.get(`/platos/get${queryString ? `?${queryString}` : ''}`);
};

export const getDishById = async (id) => {
  return axiosClient.get(`/platos/${id}`);
};

export const createDish = async (formData) => {
  return axiosClient.post('/platos/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateDish = async (id, formData) => {
  return axiosClient.put(`/platos/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteDish = async (id) => {
  return axiosClient.put(`/platos/${id}/deactivate`, {});
};

export const activateDish = async (id) => {
  return axiosClient.put(`/platos/${id}/activate`, {});
};

export const deactivateDish = async (id) => {
  return axiosClient.put(`/platos/${id}/deactivate`, {});
};
