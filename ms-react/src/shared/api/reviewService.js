import { axiosClient } from './api.js';

export const getReviews = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.restaurantID) queryParams.append('restaurantID', params.restaurantID);
  if (params.platoID) queryParams.append('platoID', params.platoID);
  if (params.userID) queryParams.append('userID', params.userID);

  const queryString = queryParams.toString();
  return axiosClient.get(`/reviews/get${queryString ? `?${queryString}` : ''}`);
};

export const createReview = async (reviewData) => {
  const normalizedRestaurantID = typeof reviewData.restaurantID === 'object' && reviewData.restaurantID !== null
    ? String(reviewData.restaurantID._id || reviewData.restaurantID.id || reviewData.restaurantID)
    : String(reviewData.restaurantID || '');

  const normalizedPlatoID = reviewData.platoID
    ? (typeof reviewData.platoID === 'object' && reviewData.platoID !== null
        ? String(reviewData.platoID._id || reviewData.platoID.id || reviewData.platoID)
        : String(reviewData.platoID))
    : undefined;

  const payload = {
    rating: Number(reviewData.rating),
    comment: String(reviewData.comment || '').trim(),
    restaurantID: normalizedRestaurantID,
  };

  if (normalizedPlatoID) {
    payload.platoID = normalizedPlatoID;
  }

  console.log('📤 reviewService.createReview enviando:', payload);
  try {
    const response = await axiosClient.post('/reviews/create', payload);
    console.log('✅ Respuesta éxito:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error en createReview:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      fullData: error.response?.data,
      requestData: payload
    });
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  return axiosClient.delete(`/reviews/${reviewId}`);
};
