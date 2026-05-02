import { create } from 'zustand';
import { getRestaurants } from '../../../shared/api/restaurantService.js';
import {
  createDish,
  deleteDish,
  getDishes,
  getDishById,
  updateDish,
} from '../../../shared/api/dishService.js';

export const useDishStore = create((set, get) => ({
  dishes: [],
  selectedDish: null,
  selectedRestaurantId: '',
  restaurantOptions: [],
  restaurantOptionsLoading: false,
  restaurantOptionsLoaded: false,
  loading: false,
  error: null,

  setSelectedRestaurantId: (restaurantId) => set({ selectedRestaurantId: restaurantId || '' }),
  clearSelectedDish: () => set({ selectedDish: null }),

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

  fetchDishes: async (restaurantId = get().selectedRestaurantId) => {
    try {
      set({ loading: true, error: null });
      const response = await getDishes({ restaurantId: restaurantId || undefined });
      const data = response.data.data || [];

      set({
        dishes: data,
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener platos';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  fetchDishById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getDishById(id);
      const dish = response.data.data;

      set({ selectedDish: dish, loading: false });
      return { success: true, data: dish };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener el plato';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  createDishAction: async (dishFormData) => {
    try {
      set({ loading: true, error: null });
      const response = await createDish(dishFormData);
      const newDish = response.data.data;
      const currentRestaurantId = get().selectedRestaurantId;

      set((state) => {
        const shouldInclude = !currentRestaurantId
          || (newDish.restaurantId?._id || newDish.restaurantId) === currentRestaurantId;

        return {
          dishes: shouldInclude
            ? [newDish, ...state.dishes]
            : state.dishes,
          loading: false,
        };
      });

      return { success: true, data: newDish };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear plato';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  updateDishAction: async (id, dishFormData) => {
    try {
      set({ loading: true, error: null });
      const response = await updateDish(id, dishFormData);
      const updatedDish = response.data.data;
      const currentRestaurantId = get().selectedRestaurantId;

      set((state) => {
        const updatedList = state.dishes
          .filter((item) => item._id !== id)
          .filter((item) => {
            if (!currentRestaurantId) return true;
            return (item.restaurantId?._id || item.restaurantId) === currentRestaurantId;
          });

        const shouldInclude = !currentRestaurantId
          || (updatedDish.restaurantId?._id || updatedDish.restaurantId) === currentRestaurantId;

        return {
          dishes: shouldInclude ? [updatedDish, ...updatedList] : updatedList,
          selectedDish: updatedDish,
          loading: false,
        };
      });

      return { success: true, data: updatedDish };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar plato';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  deleteDishAction: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDish(id);

      set((state) => ({
        dishes: state.dishes.filter((item) => item._id !== id),
        selectedDish: null,
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar plato';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  clearError: () => set({ error: null }),
}));
