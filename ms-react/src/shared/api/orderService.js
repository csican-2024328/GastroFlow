import { axiosClient } from './api.js';

// GET All Orders
export const getOrders = async (params = {}) => {
  const { data } = await axiosClient.get('/orders/get', { params });
  return data;
};

// CHECK STOCK - Verify availability before creating order
export const checkOrderStock = async (restaurantId, items) => {
  return axiosClient.post('/orders/check-stock', {
    restaurantId,
    items,
  });
};

// CREATE ORDER
export const createOrder = async (orderData) => {
  return axiosClient.post('/orders/create', orderData);
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (orderId, estado) => {
  const { data } = await axiosClient.put(`/orders/${orderId}/estado`, { estado });
  return data;
};

// PAY ORDER
export const payOrder = async (orderId, payload) => {
  const { data } = await axiosClient.put(`/orders/${orderId}/pagar`, payload);
  return data;
};

// CANCEL ORDER
export const cancelOrder = async (orderId) => {
  const { data } = await axiosClient.delete(`/orders/${orderId}`);
  return data;
};

// DELETE ORDER PERMANENT
export const deleteOrderPermanent = async (orderId) => {
  const { data } = await axiosClient.delete(`/orders/${orderId}/permanent`);
  return data;
};

// GET Client's Orders
export const getClientOrders = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.estado) queryParams.append('estado', params.estado);

  return axiosClient.get(
    `/orders/mine${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  );
};

// GET Client's Order by ID
export const getClientOrderById = async (id) => {
  return axiosClient.get(`/orders/mine/${id}`);
};

// GET Order by Order Number
export const getOrderByNumber = async (numeroOrden) => {
  return axiosClient.get(`/orders/numero/${numeroOrden}`);
};