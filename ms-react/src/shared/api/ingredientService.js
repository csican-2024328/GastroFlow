import { axiosClient } from './api.js';

export const getIngredients = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.restaurantId) queryParams.append('restaurantId', params.restaurantId);

  const queryString = queryParams.toString();
  return axiosClient.get(`/inventory/get${queryString ? `?${queryString}` : ''}`);
};

export const getIngredientById = async (id) => {
  return axiosClient.get(`/inventory/${id}`);
};

export const createIngredient = async (data) => {
  return axiosClient.post('/inventory/create', data);
};

export const updateIngredient = async (id, data) => {
  return axiosClient.put(`/inventory/${id}`, data);
};

export const deleteIngredient = async (id) => {
  return axiosClient.delete(`/inventory/${id}`);
};