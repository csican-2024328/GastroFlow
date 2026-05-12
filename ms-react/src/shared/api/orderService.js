import { axiosClient } from './api.js';

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
