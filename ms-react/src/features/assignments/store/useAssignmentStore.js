import { create } from 'zustand';
import { getPlatformAdmins, getAvailableRestaurants, assignRestaurantToAdmin } from '../../../shared/api/assignmentService.js';

export const useAssignmentStore = create((set, get) => ({
  platformAdmins: [],
  restaurants: [],
  loading: false,
  error: null,
  selectedAdmin: null,
  selectedRestaurant: null,

  /**
   * Cargar todos los platform admins
   */
  fetchPlatformAdmins: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getPlatformAdmins();
      console.log('📤 [STORE] Platform Admins obtenidos:', data);
      set({ platformAdmins: data.data || data, loading: false });
    } catch (error) {
      console.error('❌ [STORE] Error fetching platform admins:', error);
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Cargar todos los restaurantes
   */
  fetchRestaurants: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAvailableRestaurants();
      console.log('📤 [STORE] Restaurantes obtenidos:', data);
      set({ restaurants: data.data || data.restaurants || data, loading: false });
    } catch (error) {
      console.error('❌ [STORE] Error fetching restaurants:', error);
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Cargar ambos datos
   */
  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([get().fetchPlatformAdmins(), get().fetchRestaurants()]);
    } catch (error) {
      console.error('❌ [STORE] Error fetching data:', error);
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Seleccionar un admin
   */
  selectAdmin: (admin) => {
    set({ selectedAdmin: admin });
    console.log('✅ [STORE] Admin seleccionado:', admin);
  },

  /**
   * Seleccionar un restaurante
   */
  selectRestaurant: (restaurant) => {
    set({ selectedRestaurant: restaurant });
    console.log('✅ [STORE] Restaurante seleccionado:', restaurant);
  },

  /**
   * Asignar restaurante a admin
   */
  assignRestaurant: async (userId, restaurantId) => {
    set({ error: null });
    try {
      const result = await assignRestaurantToAdmin(userId, restaurantId);
      console.log('✅ [STORE] Asignación exitosa:', result);
      
      const updatedAdmins = get().platformAdmins.map((admin) =>
        admin.Id === userId || admin.id === userId
          ? { ...admin, RestaurantId: restaurantId }
          : admin
      );

      set({ platformAdmins: updatedAdmins });

      const updatedAdmin = updatedAdmins.find(
        (admin) => admin.Id === userId || admin.id === userId
      );

      return { result, updatedAdmin };
    } catch (error) {
      console.error('❌ [STORE] Error assigning restaurant:', error);
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Limpiar selecciones
   */
  clearSelection: () => {
    set({ selectedAdmin: null, selectedRestaurant: null, error: null });
  },

  /**
   * Limpiar error
   */
  clearError: () => {
    set({ error: null });
  },
}));
