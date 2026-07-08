import { create } from 'zustand';
import {
  checkOrderStock,
  createOrder,
  getOrderById,
  getClientOrders,
  payOrder,
} from '../../../shared/api/orderService.js';

export const useOrderStore = create((set) => ({
  // State
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  stockErrors: [], // Items without stock
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  },

  // Check stock availability
  checkStock: async (restaurantId, items) => {
    try {
      set({ loading: true, error: null, stockErrors: [] });
      const response = await checkOrderStock(restaurantId, items);
      
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error checking stock';
      const faltantes = error.response?.data?.data?.faltantes || [];
      
      set({
        error: message,
        stockErrors: faltantes,
        loading: false,
      });
      
      return { success: false, error: message, faltantes };
    }
  },

  // Check events / promotions applicable to an order (preview)
  checkEvents: async (orderData) => {
    try {
      set({ loading: true, error: null });
      const response = await (await import('../../../shared/api/orderService.js')).checkOrderEvents(orderData);
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error checking events';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Create order
  createOrderAction: async (orderData) => {
    try {
      set({ loading: true, error: null });
      const response = await createOrder(orderData);
      const newOrder = response.data.data;

      set((state) => ({
        orders: [newOrder, ...state.orders],
        loading: false,
      }));

      return { success: true, data: newOrder };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear pedido';
      const details = error.response?.data?.data;
      
      set({ error: message, loading: false });
      return { success: false, error: message, details };
    }
  },

  // Fetch client orders
  fetchClientOrders: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const response = await getClientOrders({ page, limit });
      
      const data = response.data.data || [];
      const pagination = response.data.pagination || {};

      set({
        orders: data,
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
      const message = error.response?.data?.message || 'Error al obtener pedidos';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Fetch order by ID
  fetchOrderById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getOrderById(id);
      const order = response.data.data;

      set({ selectedOrder: order, loading: false });
      return { success: true, data: order };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener pedido';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Pay order
  payOrderAction: async (orderId, payload) => {
    try {
      set({ loading: true, error: null });
      const response = await payOrder(orderId, payload);
      const updatedOrder = response.data.data;

      set((state) => ({
        selectedOrder: updatedOrder,
        orders: state.orders.map((order) =>
          order._id === orderId ? updatedOrder : order
        ),
        loading: false,
      }));

      return { success: true, data: updatedOrder };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar el pago';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Clear errors
  clearError: () => set({ error: null, stockErrors: [] }),
}));
