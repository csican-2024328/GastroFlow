import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getRestaurants as getRestaurantsRequest,
  getRestaurantById as getRestaurantByIdRequest,
} from '../../../shared/api/restaurantApi';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

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

export const useRestaurants = ({ autoFetch = true } = {}) => {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const isFirstRun = useRef(true);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const fetchPage = useCallback(async (pageToLoad, { append, searchTerm = '' } = {}) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);
      const { data } = await getRestaurantsRequest(pageToLoad, PAGE_SIZE, searchTerm);
      const mapped = (data.data || []).map(mapRestaurantToViewModel);

      setRestaurants((current) => {
        if (!append) return mapped;
        const existingIds = new Set(current.map((item) => item._id));
        return [...current, ...mapped.filter((item) => !existingIds.has(item._id))];
      });
      setPage(pageToLoad);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener restaurantes');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, []);

  // Búsqueda real contra el backend (GET /restaurants/get?search=), con debounce
  // para no disparar un request por cada letra. Corre de una sola vez al montar
  // (sin esperar el debounce) y de nuevo cada vez que cambia el texto de búsqueda.
  useEffect(() => {
    if (!autoFetch) return undefined;

    if (isFirstRun.current) {
      isFirstRun.current = false;
      fetchPage(1, { searchTerm: search });
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      fetchPage(1, { searchTerm: search });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, autoFetch]);

  const refresh = useCallback(() => fetchPage(1, { searchTerm: search }), [fetchPage, search]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || page >= totalPages) return;
    fetchPage(page + 1, { append: true, searchTerm: search });
  }, [fetchPage, loading, loadingMore, page, totalPages, search]);

  const getRestaurantById = useCallback(async (id) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      const { data } = await getRestaurantByIdRequest(id);
      return mapRestaurantToViewModel(data.data);
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Error al obtener el restaurante');
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return {
    restaurants,
    loading,
    loadingMore,
    error,
    hasMore: page < totalPages,
    search,
    setSearch,
    refresh,
    loadMore,
    getRestaurants: refresh,
    detailLoading,
    detailError,
    getRestaurantById,
  };
};
