import { useState, useCallback } from 'react';
import {
  createReservation as createRequest,
  getMyReservations as getRequest,
  updateReservation as updateRequest,
  cancelReservation as cancelRequest,
  getReservationById as getByIdRequest,
} from '../../../shared/api/reservationApi';

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const fetchMyReservations = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getRequest(params);
      // Format: could be { data: [...] } or just [...]
      const list = data.data || data.reservations || (Array.isArray(data) ? data : []);
      setReservations(list);
      return list;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al obtener reservaciones';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReservationById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getByIdRequest(id);
      const reservation = data.data || data;
      setSelectedReservation(reservation);
      return reservation;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al obtener la reservación';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (reservationData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await createRequest(reservationData);
      return data.data || data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al crear la reservación';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReservation = useCallback(async (id, reservationData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await updateRequest(id, reservationData);
      return data.data || data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al actualizar la reservación';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await cancelRequest(id, reason);
      // Actualizar automáticamente la lista
      await fetchMyReservations();
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al cancelar la reservación';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyReservations]);

  return {
    reservations,
    selectedReservation,
    loading,
    error,
    fetchMyReservations,
    fetchReservationById,
    createReservation,
    updateReservation,
    cancelReservation,
  };
};
