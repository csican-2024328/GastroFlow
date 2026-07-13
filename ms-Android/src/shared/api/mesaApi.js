import apiClient from './apiClient';

export const getMesas = (restaurantId, params = {}) => {
  return apiClient.get('/mesas/get', { params: { restaurantID: restaurantId, ...params } });
};
