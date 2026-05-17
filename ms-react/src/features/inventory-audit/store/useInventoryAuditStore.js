import { create } from 'zustand';
import { getInventoryMovements, getInventoryMovementById } from '../../../shared/api/inventoryAuditService.js';
import { getIngredients } from '../../../shared/api/ingredientService.js';
import { toast } from 'react-hot-toast';

export const useInventoryAuditStore = create((set, get) => ({
  movements: [],
  pagination: { currentPage: 1, pageSize: 20, total: 0, totalPages: 0 },
  loading: false,
  error: null,

  filters: {
    page: 1,
    limit: 20,
    from: '',
    to: '',
    tipo: '',
    inventoryId: ''
  },

  ingredients: [],
  ingredientsLoaded: false,

  selectedMovement: null,
  detailLoading: false,

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: 1 } // reset page on filter change
    }));
  },

  setPage: (page) => {
    set((state) => ({
      filters: { ...state.filters, page }
    }));
  },

  fetchIngredients: async (restaurantId) => {
    if (get().ingredientsLoaded) return;
    try {
      const response = await getIngredients(restaurantId ? { restaurantId } : {});
      set({ ingredients: response.data.data || [], ingredientsLoaded: true });
    } catch (error) {
      console.error('Error fetching ingredients', error);
    }
  },

  fetchMovements: async (restaurantId) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = { ...filters };
      if (restaurantId) params.restaurantId = restaurantId;
      
      const response = await getInventoryMovements(params);
      
      set({ 
        movements: response.data.data || [], 
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching movements:', error);
      set({ error: error.message, loading: false });
      toast.error('Error al cargar auditoría de inventario');
    }
  },

  fetchMovementDetail: async (id) => {
    set({ detailLoading: true, selectedMovement: null });
    try {
      const response = await getInventoryMovementById(id);
      set({ selectedMovement: response.data.data, detailLoading: false });
    } catch (error) {
      console.error('Error fetching movement detail:', error);
      set({ detailLoading: false });
      toast.error('Error al cargar detalles del movimiento');
    }
  },

  clearDetail: () => set({ selectedMovement: null })
}));
