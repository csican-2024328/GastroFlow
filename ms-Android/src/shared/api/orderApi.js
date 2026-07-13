import apiClient from './apiClient';

/**
 * GET Client's Orders
 * @param {Object} params - page, limit, estado
 */
export const getClientOrders = async (params = {}) => {
  const { data } = await apiClient.get('/orders/mine', { params });
  return data; // returns { success: true, data: [...] }
};

/**
 * GET Client's Order by ID
 * @param {string} id - Order ID
 */
export const getClientOrderById = async (id) => {
  const { data } = await apiClient.get(`/orders/mine/${id}`);
  return data; // returns { success: true, data: {...} }
};

/**
 * PAY ORDER
 * @param {string} orderId - Order ID
 * @param {Object} payload - { metodoPago, propina, cargosExtra }
 */
export const payOrder = async (orderId, payload) => {
  const { data } = await apiClient.put(`/orders/${orderId}/pagar`, payload);
  return data;
};

/**
 * DOWNLOAD Invoice PDF for a paid order
 * @param {string} orderId - Order ID
 */
export const downloadOrderInvoicePdf = async (orderId) => {
  // Returns raw arraybuffer or blob data for React Native handling
  return apiClient.get(`/orders/${orderId}/invoice/pdf`, {
    responseType: 'arraybuffer',
  });
};

/**
 * CANCEL Order
 * @param {string} orderId - Order ID
 * @param {string} motivo - Reason for cancellation
 */
export const cancelOrder = async (orderId, motivo = '') => {
  const { data } = await apiClient.delete(`/orders/${orderId}`, {
    data: { motivo },
  });
  return data;
};

/**
 * CHECK STOCK availability for the items currently in the cart
 * @param {Object} payload - { tipoPedido, restaurantID, mesaID, clienteNombre, items: [{ tipo, plato|menu, cantidad }] }
 */
export const checkOrderStock = async (payload) => {
  const { data } = await apiClient.post('/orders/check-stock', payload);
  return data;
};

/**
 * CHECK EVENTS: previsualiza descuentos por eventos/promociones vigentes
 * @param {Object} payload - mismo shape que checkOrderStock
 */
export const checkOrderEvents = async (payload) => {
  const { data } = await apiClient.post('/orders/check-events', payload);
  return data;
};

/**
 * CREATE Order from the client's cart
 * @param {Object} payload - { tipoPedido, restaurantID, mesaID, clienteNombre, items, couponCode, notas }
 */
export const createOrder = async (payload) => {
  const { data } = await apiClient.post('/orders/create', payload);
  return data;
};
