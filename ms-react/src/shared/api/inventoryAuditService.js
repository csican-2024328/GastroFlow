import { axiosClient } from './api.js';

export const getInventoryMovements = async (params) => {
  // params: { restaurantId, page, limit, from, to, tipo, inventoryId }
  const query = new URLSearchParams();
  
  if (params.restaurantId) query.append('restaurantId', params.restaurantId);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);
  if (params.tipo) query.append('tipo', params.tipo);
  if (params.inventoryId) query.append('inventoryId', params.inventoryId);

  return axiosClient.get(`/inventory-auditoria/get?${query.toString()}`);
};

export const getInventoryMovementById = async (id) => {
  return axiosClient.get(`/inventory-auditoria/${id}`);
};
