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

// CHECK EVENTS - Check active promotions/events for given items (preview discounts)
export const checkOrderEvents = async (orderData) => {
  return axiosClient.post('/orders/check-events', orderData);
};

// GET Order by ID
export const getOrderById = async (id) => {
  return axiosClient.get(`/orders/${id}`);
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

// PAY ORDER
export const payOrder = async (orderId, payload) => {
  return axiosClient.put(`/orders/${orderId}/pagar`, payload);
};

// GET Order by Order Number
export const getOrderByNumber = async (numeroOrden) => {
  return axiosClient.get(`/orders/numero/${numeroOrden}`);
};

// UPDATE Order Status
export const updateOrderStatus = async (orderId, estado) => {
  return axiosClient.put(`/orders/${orderId}/estado`, { estado });
};

// CANCEL Order
export const cancelOrder = async (orderId, motivo = '') => {
  return axiosClient.delete(`/orders/${orderId}`, {
    data: { motivo }
  });
};