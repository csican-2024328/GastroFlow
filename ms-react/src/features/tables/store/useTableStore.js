import { create } from 'zustand';
import { createMesa, deleteMesa, getMesaById, getMesas, updateMesa } from '../../../shared/api/mesaService.js';
import { getRestaurants } from '../../../shared/api/restaurantService.js';

export const useTableStore = create((set, get) => ({
  mesas: [],
  restaurantOptions: [],
  restaurantOptionsLoading: false,
  restaurantOptionsLoaded: false,
  selectedMesa: null,
  selectedRestaurantId: '',
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  },

  setSelectedRestaurantId: (restaurantID) => set({ selectedRestaurantId: restaurantID }),
  clearSelectedMesa: () => set({ selectedMesa: null }),

  fetchRestaurantOptions: async () => {
    try {
      if (get().restaurantOptionsLoaded || get().restaurantOptionsLoading) {
        return { success: true, data: get().restaurantOptions };
      }

      set({ restaurantOptionsLoading: true, error: null });
      const response = await getRestaurants({ page: 1, limit: 1000, isActive: true });
      const data = response.data.data || [];

      set({
        restaurantOptions: data,
        restaurantOptionsLoading: false,
        restaurantOptionsLoaded: true,
      });

      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener restaurantes';
      set({ error: message, restaurantOptionsLoading: false });
      return { success: false, error: message };
    }
  },

  fetchMesas: async (page = 1, limit = 10, restaurantID = get().selectedRestaurantId) => {
    try {
      set({ loading: true, error: null });
      const response = await getMesas({ page, limit, restaurantID: restaurantID || undefined });
      const data = response.data.data || [];
      const pagination = response.data.pagination || {};

      set({
        mesas: data,
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
      const message = error.response?.data?.message || 'Error al obtener mesas';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  fetchMesaById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getMesaById(id);
      const mesa = response.data.data;
      set({ selectedMesa: mesa, loading: false });
      return { success: true, data: mesa };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener la mesa';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  createMesaAction: async (mesaData) => {
    try {
      set({ loading: true, error: null });
      const response = await createMesa(mesaData);
      const newMesa = response.data.data;

      set((state) => ({
        mesas: [newMesa, ...state.mesas],
        loading: false,
      }));

      return { success: true, data: newMesa };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear la mesa';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  updateMesaAction: async (id, mesaData) => {
    try {
      set({ loading: true, error: null });
      const response = await updateMesa(id, mesaData);
      const updatedMesa = response.data.data;

      set((state) => ({
        mesas: state.mesas.map((mesa) => (mesa._id === id ? updatedMesa : mesa)),
        selectedMesa: updatedMesa,
        loading: false,
      }));

      return { success: true, data: updatedMesa };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar la mesa';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  deleteMesaAction: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteMesa(id);

      set((state) => ({
        mesas: state.mesas.filter((mesa) => mesa._id !== id),
        selectedMesa: null,
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar la mesa';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  clearError: () => set({ error: null }),
}));
