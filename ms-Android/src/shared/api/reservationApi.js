import apiClient from './apiClient';

// POST - Crear reservación
export const createReservation = (reservationData) => {
  return apiClient.post('/reservation', reservationData);
};

// GET - Obtener reservaciones del usuario
export const getMyReservations = (params = {}) => {
  return apiClient.get('/reservation', { params });
};

// GET - Obtener detalles de reservación por ID
export const getReservationById = (reservationId) => {
  return apiClient.get(`/reservation/${reservationId}`);
};

// GET - Obtener mesas disponibles para un restaurante
export const getAvailableTables = (restaurantId, date, timeStart, timeEnd) => {
  return apiClient.get(
    `/reservation/available?restaurantID=${restaurantId}&date=${date}&timeStart=${timeStart}&timeEnd=${timeEnd}`
  );
};

// PUT - Actualizar reservación
export const updateReservation = (reservationId, data) => {
  return apiClient.put(`/reservation/${reservationId}`, data);
};

// DELETE - Cancelar reservación (con razón opcional)
export const cancelReservation = (reservationId, reason = '') => {
  return apiClient.delete(`/reservation/${reservationId}`, {
    data: { reason },
  });
};
