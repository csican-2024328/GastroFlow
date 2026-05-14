import { axiosClient } from './api.js';

const AUTH_API_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3006/api/v1';
const MONGO_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3007/api/v1';

/**
 * Obtener todos los usuarios con rol RESTAURANT_ADMIN
 */
export const getPlatformAdmins = async () => {
  try {
    const response = await axiosClient.get(`${AUTH_API_URL}/users?role=RESTAURANT_ADMIN`);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant admins:', error);
    throw error;
  }
};

/**
 * Obtener todos los restaurantes disponibles
 */
export const getAvailableRestaurants = async (params = {}) => {
  try {
    const response = await axiosClient.get(`${MONGO_API_URL}/restaurants/get`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

/**
 * Asignar un restaurante a un admin de plataforma
 * @param {string} userId - ID del usuario admin
 * @param {string} restaurantId - ID del restaurante
 */
export const assignRestaurantToAdmin = async (userId, restaurantId) => {
  try {
    const response = await axiosClient.put(
      `${AUTH_API_URL}/users/${userId}/assign-restaurant`,
      { restaurantId }
    );
    return response.data;
  } catch (error) {
    console.error('Error assigning restaurant to admin:', error);
    throw error;
  }
};

/**
 * Obtener el restaurante asignado a un admin
 * @param {string} userId - ID del usuario admin
 */
export const getAdminAssignment = async (userId) => {
  try {
    const response = await axiosClient.get(`${AUTH_API_URL}/users/${userId}/assignment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin assignment:', error);
    throw error;
  }
};
