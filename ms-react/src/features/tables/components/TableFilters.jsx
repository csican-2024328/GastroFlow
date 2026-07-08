import { useEffect, useRef } from 'react';
import { useTableStore } from '../store/useTableStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
 
export const TableFilters = ({ searchTerm, onSearchChange }) => {
  const componentMountedRef    = useRef(false);
  const restaurantOptions      = useTableStore((s) => s.restaurantOptions);
  const fetchRestaurantOptions = useTableStore((s) => s.fetchRestaurantOptions);
  const restaurantOptionsLoading = useTableStore((s) => s.restaurantOptionsLoading);
  const selectedRestaurantId   = useTableStore((s) => s.selectedRestaurantId);
  const setSelectedRestaurantId = useTableStore((s) => s.setSelectedRestaurantId);
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
 
  useEffect(() => {
    fetchRestaurantOptions(true);
    componentMountedRef.current = true;
    return () => {};
  }, [fetchRestaurantOptions]);
 
  return (
    <div className="tp-filters">
 
      {/* Buscador */}
      <div className="tp-filter-group tp-filter-group--wide">
        <span className="tp-filter-label">Buscar por nombre o ubicación</span>
        <div className="tp-filter-wrap">
          <i className="ti ti-search tp-filter-icon" aria-hidden="true" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o ubicación..."
            className="tp-filter-input"
          />
        </div>
      </div>
 
      {/* Selector de restaurante */}
      {!(isRestaurantAdmin && hasRestaurantAssigned) ? (
        <div className="tp-filter-group">
          <span className="tp-filter-label">Filtrar por restaurante</span>
          <div className="tp-filter-wrap">
            <i className="ti ti-building-store tp-filter-icon" aria-hidden="true" />
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value || '')}
              disabled={restaurantOptionsLoading}
              className="tp-filter-select"
            >
              <option value="">Todos los restaurantes</option>
              {restaurantOptions.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="tp-filter-group">
          <div className="tp-filter-hint">
            <i className="ti ti-info-circle" aria-hidden="true" />
            Mostrando datos del restaurante asignado
          </div>
        </div>
      )}
 
    </div>
  );
};