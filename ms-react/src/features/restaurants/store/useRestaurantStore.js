import { create } from 'zustand';
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../../../shared/api/restaurantService.js';

export const useRestaurantStore = create((set) => ({
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
      console.log('🔄 [STORE] Obteniendo restaurantes. Página:', page, 'Límite:', limit);
      
      const response = await getRestaurants({ page, limit, isActive: true });
      
      const data = response.data.data || [];
      const pagination = response.data.pagination || {};

      console.log('✅ [STORE] Restaurantes obtenidos:', {
        count: data.length,
        page: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalRecords: pagination.totalRecords,
      });

      if (data.length === 0) {
        console.warn('⚠️  [STORE] No se obtuvieron restaurantes. Response:', response.data);
      }

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
      console.error('❌ [STORE] Error al obtener restaurantes:', {
        message,
        status: error.response?.status,
      });
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
      console.log('🔄 [STORE] Creando restaurante...', restaurantData);
      
      const response = await createRestaurant(restaurantData);
      const newRestaurant = response.data.data;

      console.log('✅ [STORE] Restaurante creado exitosamente:', newRestaurant);

      // Agregar localmente primero para feedback inmediato
      set((state) => ({
        restaurants: [newRestaurant, ...state.restaurants],
        loading: false,
      }));

      // LUEGO refresca desde el servidor para asegurar sincronización
      console.log('🔄 [STORE] Refrescando lista desde servidor...');
      const refreshResponse = await getRestaurants({ page: 1, limit: 10, isActive: true });
      const refreshedData = refreshResponse.data.data || [];
      const refreshedPagination = refreshResponse.data.pagination || {};

      set({
        restaurants: refreshedData,
        pagination: {
          currentPage: refreshedPagination.currentPage || 1,
          totalPages: refreshedPagination.totalPages || 1,
          totalRecords: refreshedPagination.totalRecords || 0,
          limit: refreshedPagination.limit || 10,
        },
      });

      console.log('✅ [STORE] Lista refrescada. Total restaurantes:', refreshedData.length);
      
      // Invalida caches en otros stores que dependen de restaurantes
      try {
        const { useTableStore } = await import('../../tables/store/useTableStore.js');
        useTableStore.setState({ restaurantOptionsLoaded: false });
        console.log('🔄 [STORE] Cache de Mesas invalidado');
      } catch (e) {
        // useTableStore podría no estar disponible
      }

      return { success: true, data: newRestaurant };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear restaurante';
      console.error('❌ [STORE] Error al crear restaurante:', {
        message,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update restaurant
  updateRestaurantAction: async (id, restaurantData) => {
    try {
      set({ loading: true, error: null });
      console.log('🔄 [STORE] Actualizando restaurante:', id);
      
      const response = await updateRestaurant(id, restaurantData);
      const updatedRestaurant = response.data.data;

      console.log('✅ [STORE] Restaurante actualizado:', updatedRestaurant);

      set((state) => ({
        restaurants: state.restaurants.map((r) =>
          r._id === id ? updatedRestaurant : r
        ),
        selectedRestaurant: updatedRestaurant,
        loading: false,
      }));

      // Refresca desde servidor para asegurar sincronización
      console.log('🔄 [STORE] Refrescando lista desde servidor después de actualizar...');
      const refreshResponse = await getRestaurants({ page: 1, limit: 10, isActive: true });
      const refreshedData = refreshResponse.data.data || [];
      const refreshedPagination = refreshResponse.data.pagination || {};

      set({
        restaurants: refreshedData,
        pagination: {
          currentPage: refreshedPagination.currentPage || 1,
          totalPages: refreshedPagination.totalPages || 1,
          totalRecords: refreshedPagination.totalRecords || 0,
          limit: refreshedPagination.limit || 10,
        },
      });

      console.log('✅ [STORE] Lista refrescada después de actualizar');
      
      // Invalida caches en otros stores
      try {
        const { useTableStore } = await import('../../tables/store/useTableStore.js');
        useTableStore.setState({ restaurantOptionsLoaded: false });
      } catch (e) {}


      return { success: true, data: updatedRestaurant };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar restaurante';
      console.error('❌ [STORE] Error al actualizar:', {
        message,
        status: error.response?.status,
      });
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Delete restaurant
  deleteRestaurantAction: async (id) => {
    try {
      set({ loading: true, error: null });
      console.log('🗑️  [STORE] Eliminando restaurante:', id);
      
      await deleteRestaurant(id);

      console.log('✅ [STORE] Restaurante eliminado exitosamente');

      // Remover localmente para feedback inmediato
      set((state) => ({
        restaurants: state.restaurants.filter((r) => r._id !== id),
        selectedRestaurant: null,
      }));

      // LUEGO refresca desde servidor para asegurar sincronización
      console.log('🔄 [STORE] Refrescando lista desde servidor después de eliminar...');
      const refreshResponse = await getRestaurants({ page: 1, limit: 10, isActive: true });
      const refreshedData = refreshResponse.data.data || [];
      const refreshedPagination = refreshResponse.data.pagination || {};

      set({
        restaurants: refreshedData,
        pagination: {
          currentPage: refreshedPagination.currentPage || 1,
          totalPages: refreshedPagination.totalPages || 1,
          totalRecords: refreshedPagination.totalRecords || 0,
          limit: refreshedPagination.limit || 10,
        },
        loading: false,
      });

      console.log('✅ [STORE] Lista refrescada después de eliminar. Total:', refreshedData.length);
      
      // Invalida caches en otros stores
      try {
        const { useTableStore } = await import('../../tables/store/useTableStore.js');
        useTableStore.setState({ restaurantOptionsLoaded: false });
      } catch (e) {}


      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar restaurante';
      console.error('❌ [STORE] Error al eliminar:', {
        message,
        status: error.response?.status,
      });
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  

  // Clear selected restaurant
  clearSelectedRestaurant: () => set({ selectedRestaurant: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
