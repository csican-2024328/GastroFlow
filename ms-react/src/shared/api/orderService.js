import { axiosClient } from './api.js';

export const getOrders = async (params = {}) => {
  const { data } = await axiosClient.get('/orders/get', { params });
  return data;
};

export const checkOrderStock = async (payload) => {
  const { data } = await axiosClient.post('/orders/check-stock', payload);
  return data;
};

export const createOrder = async (payload) => {
  const { data } = await axiosClient.post('/orders/create', payload);
  return data;
};

export const payOrder = async (orderId, payload) => {
  const { data } = await axiosClient.put(`/orders/${orderId}/pagar`, payload);
  return data;
};

export const cancelOrder = async (orderId) => {
  const { data } = await axiosClient.delete(`/orders/${orderId}`);
  return data;
};

export const deleteOrderPermanent = async (orderId) => {
  const { data } = await axiosClient.delete(`/orders/${orderId}/permanent`);
  return data;
};
