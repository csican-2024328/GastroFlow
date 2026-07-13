import { useState, useCallback } from 'react';
import { getValidEvents, getAllEvents, useEvent } from '../../../shared/api/eventApi';
import { useOrderCartStore } from '../../../shared/store/orderCartStore';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyEvent = useOrderCartStore((state) => state.applyEvent);
  const removeEvent = useOrderCartStore((state) => state.removeEvent);

  const fetchEvents = useCallback(async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (restaurantId) {
        response = await getValidEvents(restaurantId);
      } else {
        response = await getAllEvents();
      }
      setEvents(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener los eventos/ofertas');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateAndApplyEvent = useCallback(async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await useEvent(eventId);
      if (response.data?.success) {
        const eventData = response.data.data;
        const discountInfo = response.data.descuento;
        
        const mappedEvent = {
          id: eventData._id,
          name: eventData.nombre,
          discountType: discountInfo.tipo === 'PORCENTAJE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
          discountValue: discountInfo.valor,
        };
        
        applyEvent(mappedEvent);
        return { success: true, message: response.data.message || 'Promoción aplicada con éxito' };
      } else {
        throw new Error(response.data?.message || 'No se pudo aplicar la promoción');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al aplicar la promoción';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [applyEvent]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    validateAndApplyEvent,
    removeEvent,
  };
};
