import apiClient from './apiClient';

export const getReviews = (params = {}) =>
  apiClient.get('/reviews/get', { params });

export const createReview = (payload) =>
  apiClient.post('/reviews/create', payload);

export const updateReview = (id, payload) =>
  apiClient.put(`/reviews/${id}`, payload);

export const deleteReview = (id) =>
  apiClient.delete(`/reviews/${id}`);
