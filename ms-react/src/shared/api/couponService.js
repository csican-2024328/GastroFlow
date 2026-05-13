import { axiosClient } from './api.js';

export const getRestaurantVigentesCoupons = async (restaurantId) => {
  return axiosClient.get(`/coupons/restaurant/${restaurantId}/vigentes`);
};
