import { axiosClient } from './api.js';

// POST - Create reservation
export const createReservation = async (reservationData) => {
  return axiosClient.post('/reservation', reservationData);
};

// GET - Get all reservations for user
export const getUserReservations = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  if (params.restaurantID) queryParams.append('restaurantID', params.restaurantID);
  if (params.restaurantId) queryParams.append('restaurantId', params.restaurantId);

  return axiosClient.get(`/reservation${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
};

// GET - Get reservation by ID
export const getReservationById = async (reservationId) => {
  return axiosClient.get(`/reservation/${reservationId}`);
};

// GET - Get available tables for a restaurant
export const getAvailableTables = async (restaurantId, date, timeStart, timeEnd) => {
  return axiosClient.get(
    `/reservation/available?restaurantID=${restaurantId}&date=${date}&timeStart=${timeStart}&timeEnd=${timeEnd}`
  );
};

// PUT - Update reservation
export const updateReservation = async (reservationId, data) => {
  return axiosClient.put(`/reservation/${reservationId}`, data);
};

// POST - Approve or reject reservation
export const approveOrRejectReservation = async (reservationId, data) => {
  return axiosClient.post(`/reservation/${reservationId}/approve-or-reject`, data);
};

// DELETE - Cancel reservation
export const cancelReservation = async (reservationId, reason = '') => {
  return axiosClient.delete(`/reservation/${reservationId}`, {
    data: { reason },
  });
};
