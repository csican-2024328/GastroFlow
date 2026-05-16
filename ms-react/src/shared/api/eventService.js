import { axiosClient } from './api.js';

// GET vigentes events for a restaurant
export const getVicentesEvents = async (restaurantId) => {
  return axiosClient.get(`/events/restaurant/${restaurantId}/vigentes`);
};

// USE event (POST)
export const useEvent = async (eventId) => {
  return axiosClient.post(`/events/${eventId}/usar`);
};

// GET all events for a restaurant
export const getRestaurantEvents = async (restaurantId, params = {}) => {
  const queryParams = new URLSearchParams();
  queryParams.append('restaurantID', restaurantId);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  return axiosClient.get(`/events/get?${queryParams.toString()}`);
};

// GET event by ID
export const getEventById = async (eventId) => {
  return axiosClient.get(`/events/${eventId}`);
};

// CREATE event (POST)
export const createEvent = async (data) => {
  return axiosClient.post('/events/create', data);
};

// UPDATE event (PUT)
export const updateEvent = async (eventId, data) => {
  return axiosClient.put(`/events/${eventId}`, data);
};

// DELETE event
export const deleteEvent = async (eventId) => {
  return axiosClient.delete(`/events/${eventId}`);
};

// ACTIVATE event
export const activateEvent = async (eventId) => {
  return axiosClient.put(`/events/${eventId}/activate`);
};

// DEACTIVATE event
export const deactivateEvent = async (eventId) => {
  return axiosClient.put(`/events/${eventId}/deactivate`);
};
