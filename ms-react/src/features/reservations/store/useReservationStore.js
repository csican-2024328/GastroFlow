import { create } from 'zustand';
import {
  createReservation,
  approveOrRejectReservation,
  getUserReservations,
  getReservationById,
  getAvailableTables,
  updateReservation,
  cancelReservation,
} from '../../../shared/api/reservationService.js';

export const useReservationStore = create((set) => ({
  // State
  reservations: [],
  selectedReservation: null,
  availableTables: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  },

  // Create reservation
  createReservationAction: async (reservationData) => {
    try {
      set({ loading: true, error: null });
      const response = await createReservation(reservationData);
      const newReservation = response.data.data;

      set((state) => ({
        reservations: [newReservation, ...state.reservations],
        loading: false,
        selectedReservation: newReservation,
      }));

      return { success: true, data: newReservation };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear reserva';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Fetch user reservations
  fetchUserReservations: async (page = 1, limit = 10, status = null) => {
    try {
      set({ loading: true, error: null });
      const response = await getUserReservations({ page, limit, status });

      const data = response.data.data || [];
      const pagination = response.data.pagination || {};

      set({
        reservations: data,
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
      const message = error.response?.data?.message || 'Error al obtener reservas';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Get available tables
  fetchAvailableTables: async (restaurantId, date, timeStart, timeEnd) => {
    try {
      set({ loading: true, error: null });
      const response = await getAvailableTables(restaurantId, date, timeStart, timeEnd);

      const tables = response.data.data || [];

      set({
        availableTables: tables,
        loading: false,
      });

      return { success: true, data: tables };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener mesas disponibles';
      set({ error: message, availableTables: [], loading: false });
      return { success: false, error: message };
    }
  },

  // Fetch reservation by ID
  fetchReservationById: async (reservationId) => {
    try {
      set({ loading: true, error: null });
      const response = await getReservationById(reservationId);
      const reservation = response.data.data;

      set({ selectedReservation: reservation, loading: false });
      return { success: true, data: reservation };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener reserva';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update reservation
  updateReservationAction: async (reservationId, data) => {
    try {
      set({ loading: true, error: null });
      const response = await updateReservation(reservationId, data);
      const updatedReservation = response.data.data;

      set((state) => ({
        reservations: state.reservations.map((r) =>
          r._id === reservationId ? updatedReservation : r
        ),
        selectedReservation: updatedReservation,
        loading: false,
      }));

      return { success: true, data: updatedReservation };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar reserva';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Approve or reject reservation (admin workflow)
  approveOrRejectReservationAction: async (reservationId, data) => {
    try {
      set({ loading: true, error: null });
      const response = await approveOrRejectReservation(reservationId, data);
      const updatedReservation = response.data.data;

      set((state) => ({
        reservations: state.reservations.map((r) =>
          r._id === reservationId ? updatedReservation : r
        ),
        selectedReservation: updatedReservation,
        loading: false,
      }));

      return { success: true, data: updatedReservation };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar estado de la reserva';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Cancel reservation
  cancelReservationAction: async (reservationId, reason) => {
    try {
      set({ loading: true, error: null });
      const response = await cancelReservation(reservationId, reason);

      set((state) => ({
        reservations: state.reservations.map((r) =>
          r._id === reservationId ? { ...r, estado: 'CANCELADA' } : r
        ),
        loading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cancelar reserva';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Clear selected reservation
  clearSelectedReservation: () => {
    set({ selectedReservation: null });
  },

  // Clear reservations
  clearReservations: () => {
    set({ reservations: [] });
  },

  // Set error
  setError: (error) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
