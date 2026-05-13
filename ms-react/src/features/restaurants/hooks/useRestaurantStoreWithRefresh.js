import { useEffect } from 'react';
import { useRestaurantStore } from './useRestaurantStore.js';

/**
 * Hook personalizado que automáticamente refresca restaurantes al montar
 * Úsalo en lugar de useRestaurantStore directamente en componentes
 * que necesiten datos actualizados de restaurantes
 * 
 * Ejemplo:
 * const restaurants = useRestaurantStoreWithRefresh((s) => s.restaurants);
 */
export const useRestaurantStoreWithRefresh = (selector) => {
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);
  const data = useRestaurantStore(selector);

  useEffect(() => {
    console.log('🔄 [HOOK] useRestaurantStoreWithRefresh: Componente montado, refrescando restaurantes...');
    fetchRestaurants(1, 10);
    
    return () => {
      console.log('👋 [HOOK] useRestaurantStoreWithRefresh: Componente desmontado');
    };
  }, [fetchRestaurants]);

  return data;
};

/**
 * Hook para acceder al store SIN auto-refresh
 * Úsalo cuando solo necesites lecturas rápidas sin refrescar
 */
export const useRestaurantStoreSync = (selector) => {
  return useRestaurantStore(selector);
};
