import { axiosClient } from './api.js';

// GET all restaurants
export const getRestaurants = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

  return axiosClient.get(`/restaurants/get${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
};

// GET restaurant by ID
export const getRestaurantById = async (id) => {
  return axiosClient.get(`/restaurants/${id}`);
};

// CREATE restaurant (multipart/form-data for photos)
export const createRestaurant = async (data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  formData.append('address', data.address);
  formData.append('city', data.city);
  formData.append('openingHours', data.openingHours);
  formData.append('aforoMaximo', data.aforoMaximo);
  
  if (data.category) formData.append('category', data.category);
  if (data.description) formData.append('description', data.description);
  if (data.averagePrice) formData.append('averagePrice', data.averagePrice);
  
  // Agregar múltiples fotos si existen
  if (data.photos && data.photos.length > 0) {
    data.photos.forEach((photo, index) => {
      if (photo instanceof File) {
        formData.append('fotos', photo);
      }
    });
  }

  return axiosClient.post('/restaurants/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// UPDATE restaurant
export const updateRestaurant = async (id, data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  formData.append('address', data.address);
  formData.append('city', data.city);
  formData.append('openingHours', data.openingHours);
  
  if (data.aforoMaximo) formData.append('aforoMaximo', data.aforoMaximo);
  if (data.category) formData.append('category', data.category);
  if (data.description) formData.append('description', data.description);
  if (data.averagePrice) formData.append('averagePrice', data.averagePrice);
  
  // Agregar nuevas fotos si existen (sin incluir URLs existentes)
  if (data.photos && data.photos.length > 0) {
    data.photos.forEach((photo) => {
      if (photo instanceof File) {
        formData.append('fotos', photo);
      }
    });
  }

  return axiosClient.put(`/restaurants/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// DELETE restaurant
export const deleteRestaurant = async (id) => {
  return axiosClient.delete(`/restaurants/${id}`);
};

