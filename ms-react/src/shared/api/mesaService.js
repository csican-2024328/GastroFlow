import { axiosClient } from './api.js';

export const getMesas = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
  if (params.restaurantID) queryParams.append('restaurantID', params.restaurantID);

  const queryString = queryParams.toString();
  return axiosClient.get(`/mesas/get${queryString ? `?${queryString}` : ''}`);
};

export const getMesaById = async (id) => {
  return axiosClient.get(`/mesas/${id}`);
};

export const createMesa = async (data) => {
  return axiosClient.post('/mesas/create', data);
};

export const updateMesa = async (id, data) => {
  return axiosClient.put(`/mesas/${id}`, data);
};

export const deleteMesa = async (id) => {
  return axiosClient.delete(`/mesas/${id}`);
};
