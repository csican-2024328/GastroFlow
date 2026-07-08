import { axiosClient } from './api.js';

export const getRestaurantVigentesCoupons = async (restaurantId) => {
  return axiosClient.get(`/coupons/restaurant/${restaurantId}/vigentes`);
};

export const getCoupons = async (params = {}) => {
  return axiosClient.get('/coupons/get', { params });
};

export const createCoupon = async (data) => {
  return axiosClient.post('/coupons/create', data);
};

export const updateCoupon = async (id, data) => {
  return axiosClient.put(`/coupons/${id}`, data);
};

export const deactivateCoupon = async (id) => {
  return axiosClient.put(`/coupons/${id}/deactivate`);
};

export const activateCoupon = async (id) => {
  return axiosClient.put(`/coupons/${id}/activate`);
};

export const getCouponById = async (id) => {
  return axiosClient.get(`/coupons/${id}`);
};

export const validateCoupon = async ({ codigo, montoTotal, restaurantID }) => {
  return axiosClient.post('/coupons/validate', {
    codigo,
    montoTotal,
    restaurantID,
  });
};
