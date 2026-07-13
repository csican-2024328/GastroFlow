import apiClient from './apiClient';

export const getRestaurants = (page = 1, limit = 10, search = '') =>
  apiClient.get('/restaurants/get', { params: { page, limit, isActive: true, search: search || undefined } });

export const getRestaurantById = (id) => apiClient.get(`/restaurants/${id}`);
