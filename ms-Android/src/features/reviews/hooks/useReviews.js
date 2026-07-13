import { useState, useCallback } from 'react';
import { getReviews, createReview, updateReview, deleteReview } from '../../../shared/api/reviewApi';

export const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReviews(params);
      setReviews(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener las reseñas');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addReview = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createReview(payload);
      if (response.data?.success) {
        // Refresh local reviews or append
        const newReview = response.data.data;
        setReviews((prev) => [newReview, ...prev]);
        return { success: true, message: 'Reseña publicada con éxito' };
      }
      throw new Error(response.data?.message || 'Error al crear la reseña');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al crear la reseña';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const editReview = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateReview(id, payload);
      if (response.data?.success) {
        const updatedReview = response.data.data;
        setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, ...updatedReview } : r)));
        return { success: true, message: 'Reseña actualizada con éxito' };
      }
      throw new Error(response.data?.message || 'Error al actualizar la reseña');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar la reseña';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const removeReview = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteReview(id);
      if (response.data?.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        return { success: true, message: 'Reseña eliminada con éxito' };
      }
      throw new Error(response.data?.message || 'Error al eliminar la reseña');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar la reseña';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    addReview,
    editReview,
    removeReview,
  };
};
