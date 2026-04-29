import { create } from 'zustand';
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../../../shared/api/restaurantService.js';

export const useRestaurantStore = create((set, get) => ({
  // State
  restaurants: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  },

  // Fetch all restaurants
  fetchRestaurants: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const response = await getRestaurants({ page, limit, isActive: true });
      
      const data = response.data.data || [];
      const pagination = response.data.pagination || {};

      set({
        restaurants: data,
        pagination: {
          currentPage: pagination.currentPage || 1,
          totalPages: pagination.totalPages || 1,
          totalRecords: pagination.totalRecords || 0,
          limit: pagination.limit || 10,
        },
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener restaurantes';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Fetch restaurant by ID
  fetchRestaurantById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getRestaurantById(id);
      const restaurant = response.data.data;

      set({ selectedRestaurant: restaurant, loading: false });
      return { success: true, data: restaurant };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener restaurante';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Create restaurant
  createRestaurantAction: async (restaurantData) => {
    try {
      set({ loading: true, error: null });
      const response = await createRestaurant(restaurantData);
      const newRestaurant = response.data.data;

      set((state) => ({
        restaurants: [newRestaurant, ...state.restaurants],
        loading: false,
      }));

      return { success: true, data: newRestaurant };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear restaurante';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update restaurant
  updateRestaurantAction: async (id, restaurantData) => {
    try {
      set({ loading: true, error: null });
      const response = await updateRestaurant(id, restaurantData);
      const updatedRestaurant = response.data.data;

      set((state) => ({
        restaurants: state.restaurants.map((r) =>
          r._id === id ? updatedRestaurant : r
        ),
        selectedRestaurant: updatedRestaurant,
        loading: false,
      }));

      return { success: true, data: updatedRestaurant };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar restaurante';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Delete restaurant
  deleteRestaurantAction: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteRestaurant(id);

      set((state) => ({
        restaurants: state.restaurants.filter((r) => r._id !== id),
        selectedRestaurant: null,
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar restaurante';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  

  // Clear selected restaurant
  clearSelectedRestaurant: () => set({ selectedRestaurant: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
