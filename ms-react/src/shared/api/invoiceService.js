import { axiosClient } from './api.js';

export const getInvoices = async (params = {}) => {
  return axiosClient.get('/invoices/get', { params });
};

export const getInvoiceById = async (id) => {
  return axiosClient.get(`/invoices/${id}`);
};

export const createInvoice = async (data) => {
  return axiosClient.post('/invoices/create', data);
};

export const updateInvoiceStatus = async (id, data) => {
  return axiosClient.put(`/invoices/${id}/status`, data);
};

export const deleteInvoice = async (id) => {
  return axiosClient.delete(`/invoices/${id}`);
};