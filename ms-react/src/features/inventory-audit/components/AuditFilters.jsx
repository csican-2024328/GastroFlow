import React, { useEffect } from 'react';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
 
export const AuditFilters = () => {
  const { filters, setFilter, fetchIngredients, ingredients, fetchMovements } = useInventoryAuditStore();
  const userRole         = useAuthStore((state) => state.user?.role);
  const userRestaurantId = useAuthStore((state) => state.user?.restaurantId);
  const { restaurants, fetchRestaurants } = useRestaurantStore();
 
  /* ── Effect — INTACTO ── */
  useEffect(() => {
    if (userRole === 'PLATFORM_ADMIN') {
      fetchRestaurants(1, 100);
      fetchIngredients(filters.restaurantId || null);
    } else if (userRestaurantId) {
      fetchIngredients(userRestaurantId);
    }
  }, [userRole, userRestaurantId, fetchIngredients, fetchRestaurants, filters.restaurantId]);
 
  /* ── Handlers — INTACTOS ── */
  const handleApply = () => {
    const restId = userRole === 'PLATFORM_ADMIN' ? filters.restaurantId : userRestaurantId;
    fetchMovements(restId);
  };
 
  const handleClear = () => {
    setFilter('from', '');
    setFilter('to', '');
    setFilter('tipo', '');
    setFilter('inventoryId', '');
    if (userRole === 'PLATFORM_ADMIN') setFilter('restaurantId', '');
    setTimeout(() => {
      const restId = userRole === 'PLATFORM_ADMIN' ? '' : userRestaurantId;
      fetchMovements(restId);
    }, 0);
  };
 
  return (
    <div className="ia-filters">
 
      {/* Restaurante (solo PLATFORM_ADMIN) */}
      {userRole === 'PLATFORM_ADMIN' && (
        <div className="ia-filter-group">
          <span className="ia-filter-label">Restaurante</span>
          <div className="ia-filter-wrap">
            <i className="ti ti-building-store ia-filter-icon" aria-hidden="true" />
            <select
              className="ia-filter-select"
              value={filters.restaurantId || ''}
              onChange={(e) => setFilter('restaurantId', e.target.value)}
            >
              <option value="">Todos los restaurantes</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.nombre || r.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
 
      {/* Fecha Desde */}
      <div className="ia-filter-group">
        <span className="ia-filter-label">Fecha Desde</span>
        <div className="ia-filter-wrap">
          <i className="ti ti-calendar ia-filter-icon" aria-hidden="true" />
          <input
            type="date"
            className="ia-filter-input"
            value={filters.from}
            onChange={(e) => setFilter('from', e.target.value)}
          />
        </div>
      </div>
 
      {/* Fecha Hasta */}
      <div className="ia-filter-group">
        <span className="ia-filter-label">Fecha Hasta</span>
        <div className="ia-filter-wrap">
          <i className="ti ti-calendar-event ia-filter-icon" aria-hidden="true" />
          <input
            type="date"
            className="ia-filter-input"
            value={filters.to}
            onChange={(e) => setFilter('to', e.target.value)}
          />
        </div>
      </div>
 
      {/* Tipo de movimiento */}
      <div className="ia-filter-group">
        <span className="ia-filter-label">Tipo de Mov.</span>
        <div className="ia-filter-wrap">
          <i className="ti ti-arrows-exchange ia-filter-icon" aria-hidden="true" />
          <select
            className="ia-filter-select"
            value={filters.tipo}
            onChange={(e) => setFilter('tipo', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
          </select>
        </div>
      </div>
 
      {/* Insumo */}
      <div className="ia-filter-group">
        <span className="ia-filter-label">Insumo</span>
        <div className="ia-filter-wrap">
          <i className="ti ti-carrot ia-filter-icon" aria-hidden="true" />
          <select
            className="ia-filter-select"
            value={filters.inventoryId}
            onChange={(e) => setFilter('inventoryId', e.target.value)}
          >
            <option value="">Todos</option>
            {ingredients.map((ing) => (
              <option key={ing._id} value={ing._id}>{ing.nombre}</option>
            ))}
          </select>
        </div>
      </div>
 
      {/* Botones */}
      <div className="ia-filter-btns">
        <button onClick={handleClear} className="ia-btn ia-btn-clear">
          <i className="ti ti-x" aria-hidden="true" />
          Limpiar
        </button>
        <button onClick={handleApply} className="ia-btn ia-btn-search">
          <i className="ti ti-search" aria-hidden="true" />
          Buscar
        </button>
      </div>
 
    </div>
  );
};