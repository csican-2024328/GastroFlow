import { useEffect } from 'react';
import { useMenuStore } from '../store/useMenuStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
 
export const MenuFilters = ({ searchTerm, onSearchChange }) => {
  const restaurantOptions       = useMenuStore((s) => s.restaurantOptions);
  const fetchRestaurantOptions  = useMenuStore((s) => s.fetchRestaurantOptions);
  const selectedRestaurantId    = useMenuStore((s) => s.selectedRestaurantId);
  const setSelectedRestaurantId = useMenuStore((s) => s.setSelectedRestaurantId);
  const { isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
 
  useEffect(() => { fetchRestaurantOptions(); }, [fetchRestaurantOptions]);
 
  return (
    <div className="ds-filters menu-filters">
      <div className="ds-filter-group ds-filter-group--wide">
        <span className="ds-filter-label">Buscar por nombre</span>
        <div className="ds-filter-wrap">
          <i className="ti ti-search ds-filter-icon" aria-hidden="true" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre..."
            className="ds-filter-input"
          />
        </div>
      </div>
 
      {!(isRestaurantAdmin && hasRestaurantAssigned) ? (
        <div className="ds-filter-group">
          <span className="ds-filter-label">Filtrar por restaurante</span>
          <div className="ds-filter-wrap">
            <i className="ti ti-building-store ds-filter-icon" aria-hidden="true" />
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="ds-filter-select"
            >
              <option value="">Todos los restaurantes</option>
              {restaurantOptions.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="ds-filter-group">
          <div className="ds-filter-hint">
            <i className="ti ti-lock" aria-hidden="true" />
            Mostrando datos del restaurante asignado
          </div>
        </div>
      )}
    </div>
  );
};