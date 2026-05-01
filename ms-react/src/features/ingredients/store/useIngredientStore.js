import { create } from 'zustand';
import { getRestaurants } from '../../../shared/api/restaurantService.js';
import {
  createIngredient,
  deleteIngredient,
  getIngredients,
  getIngredientById,
  updateIngredient,
} from '../../../shared/api/ingredientService.js';

const normalizeRestaurantId = (restaurant) => restaurant?._id || restaurant || '';

export const useIngredientStore = create((set, get) => ({
  ingredients: [],
  selectedIngredient: null,
  selectedRestaurantId: '',
  restaurantOptions: [],
  restaurantOptionsLoading: false,
  restaurantOptionsLoaded: false,
  loading: false,
  error: null,

  setSelectedRestaurantId: (restaurantId) => set({ selectedRestaurantId: restaurantId || '' }),
  clearSelectedIngredient: () => set({ selectedIngredient: null }),

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

  fetchIngredients: async (restaurantId = get().selectedRestaurantId) => {
    try {
      set({ loading: true, error: null });
      const response = await getIngredients({ restaurantId: restaurantId || undefined });
      const data = response.data.data || [];

      set({
        ingredients: data,
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener ingredientes';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  fetchIngredientById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getIngredientById(id);
      const ingredient = response.data.data;

      set({ selectedIngredient: ingredient, loading: false });
      return { success: true, data: ingredient };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener el ingrediente';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  createIngredientAction: async (ingredientData) => {
    try {
      set({ loading: true, error: null });
      const response = await createIngredient(ingredientData);
      const newIngredient = response.data.data;
      const currentRestaurantId = get().selectedRestaurantId;

      set((state) => {
        const shouldInclude = !currentRestaurantId
          || normalizeRestaurantId(newIngredient.restaurantId) === currentRestaurantId;

        return {
          ingredients: shouldInclude
            ? [newIngredient, ...state.ingredients]
            : state.ingredients,
          loading: false,
        };
      });

      return { success: true, data: newIngredient };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear ingrediente';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  updateIngredientAction: async (id, ingredientData) => {
    try {
      set({ loading: true, error: null });
      const response = await updateIngredient(id, ingredientData);
      const updatedIngredient = response.data.data;
      const currentRestaurantId = get().selectedRestaurantId;

      set((state) => {
        const updatedList = state.ingredients
          .filter((item) => item._id !== id)
          .filter((item) => {
            if (!currentRestaurantId) return true;
            return normalizeRestaurantId(item.restaurantId) === currentRestaurantId;
          });

        const shouldInclude = !currentRestaurantId
          || normalizeRestaurantId(updatedIngredient.restaurantId) === currentRestaurantId;

        return {
          ingredients: shouldInclude ? [updatedIngredient, ...updatedList] : updatedList,
          selectedIngredient: updatedIngredient,
          loading: false,
        };
      });

      return { success: true, data: updatedIngredient };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar ingrediente';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  deleteIngredientAction: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteIngredient(id);

      set((state) => ({
        ingredients: state.ingredients.filter((item) => item._id !== id),
        selectedIngredient: null,
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar ingrediente';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  clearError: () => set({ error: null }),
}));