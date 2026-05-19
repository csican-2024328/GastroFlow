import { create } from 'zustand';
import * as reviewService from '../../../shared/api/reviewService.js';

export const useReviewStore = create((set) => ({
  reviews: [],
  loading: false,
  error: null,
  averageRating: 0,
  filters: {
    restaurantID: null,
    platoID: null,
    userID: null,
  },

  // Obtener reseñas con filtros opcionales
  fetchReviews: async (restaurantIDOrFilters = null, platoID = null, userID = null) => {
    set({ loading: true, error: null });
    try {
      const params = {};

      if (restaurantIDOrFilters && typeof restaurantIDOrFilters === 'object' && !Array.isArray(restaurantIDOrFilters)) {
        if (restaurantIDOrFilters.restaurantID) params.restaurantID = restaurantIDOrFilters.restaurantID;
        if (restaurantIDOrFilters.platoID) params.platoID = restaurantIDOrFilters.platoID;
        if (restaurantIDOrFilters.userID) params.userID = restaurantIDOrFilters.userID;
      } else {
        if (restaurantIDOrFilters) params.restaurantID = restaurantIDOrFilters;
        if (platoID) params.platoID = platoID;
        if (userID) params.userID = userID;
      }

      const response = await reviewService.getReviews(params);
      const reviewsData = response.data.data || [];

      // Calcular promedio de rating
      const avgRating =
        reviewsData.length > 0
          ? (reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length).toFixed(1)
          : 0;

      set({
        reviews: reviewsData,
        averageRating: parseFloat(avgRating),
        filters: {
          restaurantID: params.restaurantID || null,
          platoID: params.platoID || null,
          userID: params.userID || null,
        },
        loading: false,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al obtener reseñas';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Crear nueva reseña
  createReview: async (reviewData) => {
    set({ loading: true, error: null });
    try {
      const response = await reviewService.createReview(reviewData);
      const newReview = response.data.data;

      set((state) => {
        const updatedReviews = [newReview, ...state.reviews];
        const avgRating =
          updatedReviews.length > 0
            ? (updatedReviews.reduce((sum, review) => sum + review.rating, 0) / updatedReviews.length).toFixed(1)
            : 0;

        return {
          reviews: updatedReviews,
          averageRating: parseFloat(avgRating),
          loading: false,
        };
      });

      return { success: true, data: newReview };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear reseña';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Eliminar reseña
  deleteReview: async (reviewId) => {
    set({ loading: true, error: null });
    try {
      await reviewService.deleteReview(reviewId);

      set((state) => {
        const updatedReviews = state.reviews.filter((review) => review._id !== reviewId);
        const avgRating =
          updatedReviews.length > 0
            ? (updatedReviews.reduce((sum, review) => sum + review.rating, 0) / updatedReviews.length).toFixed(1)
            : 0;

        return {
          reviews: updatedReviews,
          averageRating: parseFloat(avgRating),
          loading: false,
        };
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar reseña';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Limpiar el store
  clearReviews: () => {
    set({
      reviews: [],
      averageRating: 0,
      error: null,
        filters: { restaurantID: null, platoID: null, userID: null },
    });
  },
}));
