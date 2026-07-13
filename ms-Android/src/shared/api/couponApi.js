import apiClient from './apiClient';

export const getValidCoupons = (restaurantID) =>
  apiClient.get(`/coupons/restaurant/${restaurantID}/vigentes`);

export const getCouponByCode = (codigo) =>
  apiClient.get(`/coupons/code/${codigo}`);

export const validateCoupon = (payload) =>
  apiClient.post('/coupons/validate', payload);

export const getAllCoupons = (params = { isActive: true }) =>
  apiClient.get('/coupons/get', { params });

