import apiClient from './apiClient';

export const getValidEvents = (restaurantID) =>
  apiClient.get(`/events/restaurant/${restaurantID}/vigentes`);

export const useEvent = (eventId) =>
  apiClient.post(`/events/${eventId}/usar`);

export const getAllEvents = (params = { isActive: true }) =>
  apiClient.get('/events/get', { params });
