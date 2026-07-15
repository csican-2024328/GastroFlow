import { useCallback, useState } from 'react';
import { useApiRequest } from '../../../shared/hooks/useApiRequest';
import { getPlatos, getMenus } from '../../../shared/api/catalogApi';

const CATALOG_PAGE_SIZE = 50;

const resolveRestaurantId = (value) => {
  if (value && typeof value === 'object') return value._id || null;
  return value || null;
};

const resolveRestaurantNombre = (value) => {
  if (value && typeof value === 'object') return value.nombre || null;
  return null;
};

const mapToViewModel = (item, tipo) => ({
  id: item._id,
  tipo,
  nombre: item.nombre,
  descripcion: item.descripcion || '',
  precio: item.precio,
  foto: item.foto || null,
  disponible: item.disponible !== false,
  restaurantId: resolveRestaurantId(item.restaurantId),
  restaurantNombre: resolveRestaurantNombre(item.restaurantId),
});

export const useCatalog = () => {
  const { loading, error, execute } = useApiRequest();
  const [items, setItems] = useState([]);

  const fetchCatalog = useCallback(async (restaurantId) => {
    const result = await execute(async () => {
      const params = { page: 1, limit: CATALOG_PAGE_SIZE, isActive: true, ...(restaurantId && { restaurantId }) };
      const [platosRes, menusRes] = await Promise.all([getPlatos(params), getMenus(params)]);

      const platos = (platosRes.data?.data || []).map((item) => mapToViewModel(item, 'PLATO'));
      const menus = (menusRes.data?.data || []).map((item) => mapToViewModel(item, 'MENU'));

      return [...platos, ...menus];
    }, 'No se pudo cargar el catálogo.');

    if (result.success) {
      setItems(result.data);
    }

    return result;
  }, [execute]);

  return { items, loading, error, fetchCatalog };
};
