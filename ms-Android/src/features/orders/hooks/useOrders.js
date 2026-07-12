import { useState, useCallback } from 'react';
import {
  getClientOrders,
  getClientOrderById,
  payOrder,
  cancelOrder,
} from '../../../shared/api/orderApi';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [error, setError] = useState(null);

  // Fetch list of client's orders
  const fetchOrders = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getClientOrders(params);
      if (response && response.success) {
        setOrders(response.data || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching client orders:', err);
      setError(err.message || 'No se pudieron cargar tus pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch details of a single order
  const fetchOrderDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getClientOrderById(id);
      if (response && response.success) {
        setSelectedOrder(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'No se pudieron cargar los detalles del pedido.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Process payment
  const submitPayment = useCallback(async (orderId, paymentData) => {
    try {
      setUpdatingPayment(true);
      setError(null);
      const response = await payOrder(orderId, paymentData);
      if (response && response.success) {
        const updated = response.data;
        setSelectedOrder(updated);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o))
        );
        return { success: true, data: updated };
      }
      return { success: false, error: 'Respuesta del servidor inválida' };
    } catch (err) {
      console.error('Error submitting payment:', err);
      const msg = err.response?.data?.message || err.message || 'Error al procesar el pago';
      return { success: false, error: msg };
    } finally {
      setUpdatingPayment(false);
    }
  }, []);

  // Cancel order
  const cancelOrderAction = useCallback(async (orderId, motivo = '') => {
    try {
      setCancellingOrder(true);
      setError(null);
      const response = await cancelOrder(orderId, motivo);
      if (response && response.success) {
        const updated = response.data;
        setSelectedOrder(updated);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o))
        );
        return { success: true, data: updated };
      }
      return { success: false, error: 'Respuesta del servidor inválida' };
    } catch (err) {
      console.error('Error cancelling order:', err);
      const msg = err.response?.data?.message || err.message || 'Error al cancelar el pedido';
      return { success: false, error: msg };
    } finally {
      setCancellingOrder(false);
    }
  }, []);

  return {
    orders,
    selectedOrder,
    loading,
    updatingPayment,
    cancellingOrder,
    error,
    fetchOrders,
    fetchOrderDetails,
    submitPayment,
    cancelOrderAction,
  };
};
