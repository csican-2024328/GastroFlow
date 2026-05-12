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
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  return axiosClient.get(
    `/events/restaurant/${restaurantId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  );
};

// GET event by ID
export const getEventById = async (eventId) => {
  return axiosClient.get(`/events/${eventId}`);
};
