import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../shared/api/apiClient';

const mapRestaurantToViewModel = (restaurant) => {
  const photos = Array.isArray(restaurant.photos)
    ? restaurant.photos
    : Array.isArray(restaurant.fotos)
      ? restaurant.fotos
      : [];

  return {
    ...restaurant,
    photos,
    image: photos[0] || null,
    address: restaurant.address || restaurant.direccion || '',
    isAvailable: Boolean(restaurant.isActive),
  };
};

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/restaurants/get', {
        params: { page: 1, limit: 20, isActive: true },
      });
      const rawRestaurants = response.data.data || response.data || [];
      setRestaurants(rawRestaurants.map(mapRestaurantToViewModel));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener restaurantes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  return { restaurants, loading, error, getRestaurants };
};
