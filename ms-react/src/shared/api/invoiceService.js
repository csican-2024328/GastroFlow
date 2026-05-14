import { axiosClient } from './api.js';

export const getInvoices = async (params = {}) => {
  return axiosClient.get('/invoices/get', { params });
};