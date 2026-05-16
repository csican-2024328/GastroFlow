import { create } from 'zustand';
import { getRestaurants } from '../../../shared/api/restaurantService.js';
import {
  createMenu,
  deleteMenu,
  getMenus,
  getMenuById,
  updateMenu,
} from '../../../shared/api/menuService.js';

export const useMenuStore = create((set, get) => ({
  menus: [],
  selectedMenu: null,
  selectedRestaurantId: '',
  restaurantOptions: [],
  restaurantOptionsLoading: false,
  restaurantOptionsLoaded: false,
  loading: false,
  error: null,

  setSelectedRestaurantId: (restaurantId) => set({ selectedRestaurantId: restaurantId || '' }),
  clearSelectedMenu: () => set({ selectedMenu: null }),

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

  fetchMenus: async (restaurantId = get().selectedRestaurantId) => {
    try {
      set({ loading: true, error: null });
      const response = await getMenus({ restaurantId: restaurantId || undefined, limit: 1000 });
      const data = response.data.data || [];

      set({
        menus: data,
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener menús';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  fetchMenuById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getMenuById(id);
      const menu = response.data.data;

      set({ selectedMenu: menu, loading: false });
      return { success: true, data: menu };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener el menú';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  createMenuAction: async (menuFormData) => {
    try {
      set({ loading: true, error: null });
      const response = await createMenu(menuFormData);
      const newMenu = response.data.data;
      const currentRestaurantId = get().selectedRestaurantId;

      set((state) => {
        const shouldInclude = !currentRestaurantId
          || (newMenu.restaurantId?._id || newMenu.restaurantId) === currentRestaurantId;

        return {
          menus: shouldInclude
            ? [newMenu, ...state.menus]
            : state.menus,
          loading: false,
        };
      });

      return { success: true, data: newMenu };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear menú';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  updateMenuAction: async (id, menuFormData) => {
    try {
      set({ loading: true, error: null });
      const response = await updateMenu(id, menuFormData);
      const updatedMenu = response.data.data;

      set((state) => ({
        menus: state.menus.map((m) =>
          m._id === id ? updatedMenu : m
        ),
        selectedMenu: updatedMenu,
        loading: false,
      }));

      return { success: true, data: updatedMenu };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar menú';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  deleteMenuAction: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteMenu(id);

      set((state) => ({
        menus: state.menus.filter((m) => m._id !== id),
        selectedMenu: null,
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar menú';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },
}));
