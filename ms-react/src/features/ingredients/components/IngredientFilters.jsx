import { useEffect, useRef } from 'react';
import { useIngredientStore } from '../store/useIngredientStore.js';
 
export const IngredientFilters = ({ searchTerm, onSearchChange, hideRestaurantFilter = false }) => {
  const componentMountedRef      = useRef(false);
  const restaurantOptions        = useIngredientStore((s) => s.restaurantOptions);
  const fetchRestaurantOptions   = useIngredientStore((s) => s.fetchRestaurantOptions);
  const restaurantOptionsLoading = useIngredientStore((s) => s.restaurantOptionsLoading);
  const selectedRestaurantId     = useIngredientStore((s) => s.selectedRestaurantId);
  const setSelectedRestaurantId  = useIngredientStore((s) => s.setSelectedRestaurantId);
 
  useEffect(() => {
    fetchRestaurantOptions(true);
    componentMountedRef.current = true;
    return () => {};
  }, [fetchRestaurantOptions]);
 
  return (
    <div className="ig-filters">
 
      {/* Buscador */}
      <div className="ig-filter-group ig-filter-group--wide">
        <span className="ig-filter-label">Buscar por nombre</span>
        <div className="ig-filter-wrap">
          <i className="ti ti-search ig-filter-icon" aria-hidden="true" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre..."
            className="ig-filter-input"
          />
        </div>
      </div>
 
      {/* Selector de restaurante */}
      {!hideRestaurantFilter ? (
        <div className="ig-filter-group">
          <span className="ig-filter-label">Filtrar por restaurante</span>
          <div className="ig-filter-wrap">
            <i className="ti ti-building-store ig-filter-icon" aria-hidden="true" />
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value || '')}
              disabled={restaurantOptionsLoading}
              className="ig-filter-select"
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
      ) : null}
 
    </div>
  );
};