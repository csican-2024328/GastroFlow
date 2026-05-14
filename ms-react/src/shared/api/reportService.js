import { axiosClient } from './api.js';

export const getDemandReport = async (params = {}) => {
  return axiosClient.get('/reports/demanda-restaurantes', { params });
};

export const getReservationsReport = async (params = {}) => {
  return axiosClient.get('/reports/reservaciones', { params });
};

export const getIncomeReport = async (params = {}) => {
  return axiosClient.get('/reports/ingresos', { params });
};

export const getTopPlatosReport = async (params = {}) => {
  return axiosClient.get('/reports/top-platos', { params });
};

export const getHorasPicoReport = async (params = {}) => {
  return axiosClient.get('/reports/horas-pico', { params });
};