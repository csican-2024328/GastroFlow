import { create } from 'zustand';
import {
  getVicentesEvents,
  getRestaurantEvents,
  getEventById,
  useEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  activateEvent,
  deactivateEvent,
} from '../../../shared/api/eventService.js';

export const useEventStore = create((set) => ({
  // State
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  },

  // Fetch vigentes events for a restaurant
  fetchVicentesEvents: async (restaurantId) => {
    try {
      set({ loading: true, error: null });
      const response = await getVicentesEvents(restaurantId);
      
      const data = response.data.data || [];

      set({
        events: data,
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener eventos';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Fetch all events for a restaurant
  fetchRestaurantEvents: async (restaurantId, page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const response = await getRestaurantEvents(restaurantId, { page, limit });
      
      const data = response.data.data || [];
      const pagination = response.data.pagination || {};

      set({
        events: data,
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
      const message = error.response?.data?.message || 'Error al obtener eventos';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Fetch event by ID
  fetchEventById: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const response = await getEventById(eventId);
      const event = response.data.data;

      set({ selectedEvent: event, loading: false });
      return { success: true, data: event };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener evento';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Use event
  useEventAction: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const response = await useEvent(eventId);

      // Update the event status in the list if needed
      set((state) => ({
        events: state.events.map((e) =>
          e._id === eventId ? { ...e, usado: true } : e
        ),
        loading: false,
      }));

      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al usar evento';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Create event
  createEventAction: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await createEvent(data);
      const newEvent = response.data.data;

      set((state) => ({
        events: [newEvent, ...state.events],
        loading: false,
      }));

      return { success: true, data: newEvent };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear evento';
      const detailedErrors = error.response?.data?.errors || null;
      set({ error: message, loading: false });
      return { success: false, error: message, errors: detailedErrors };
    }
  },

  // Update event
  updateEventAction: async (eventId, data) => {
    try {
      set({ loading: true, error: null });
      const response = await updateEvent(eventId, data);
      const updatedEvent = response.data.data;

      set((state) => ({
        events: state.events.map((e) =>
          e._id === eventId ? updatedEvent : e
        ),
        selectedEvent: state.selectedEvent?._id === eventId ? updatedEvent : state.selectedEvent,
        loading: false,
      }));

      return { success: true, data: updatedEvent };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar evento';
      const detailedError = error.response?.data?.error || message;
      set({ error: detailedError, loading: false });
      return { success: false, error: detailedError };
    }
  },

  // Delete event
  deleteEventAction: async (eventId) => {
    try {
      set({ loading: true, error: null });
      await deleteEvent(eventId);

      set((state) => ({
        events: state.events.filter((e) => e._id !== eventId),
        selectedEvent: state.selectedEvent?._id === eventId ? null : state.selectedEvent,
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar evento';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Activate event
  activateEventAction: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const response = await activateEvent(eventId);
      const updatedEvent = response.data.data;

      set((state) => ({
        events: state.events.map((e) =>
          e._id === eventId ? updatedEvent : e
        ),
        selectedEvent: state.selectedEvent?._id === eventId ? updatedEvent : state.selectedEvent,
        loading: false,
      }));

      return { success: true, data: updatedEvent };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al activar evento';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Deactivate event
  deactivateEventAction: async (eventId) => {
    try {
      set({ loading: true, error: null });
      const response = await deactivateEvent(eventId);
      const updatedEvent = response.data.data;

      set((state) => ({
        events: state.events.map((e) =>
          e._id === eventId ? updatedEvent : e
        ),
        selectedEvent: state.selectedEvent?._id === eventId ? updatedEvent : state.selectedEvent,
        loading: false,
      }));

      return { success: true, data: updatedEvent };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al desactivar evento';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Clear selected event
  clearSelectedEvent: () => {
    set({ selectedEvent: null });
  },

  // Clear events
  clearEvents: () => {
    set({ events: [] });
  },
}));
