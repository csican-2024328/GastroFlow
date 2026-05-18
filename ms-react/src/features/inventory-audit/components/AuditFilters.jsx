import React, { useEffect } from 'react';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';

export const AuditFilters = () => {
  const { filters, setFilter, fetchIngredients, ingredients, fetchMovements } = useInventoryAuditStore();
  const userRole = useAuthStore((state) => state.user?.role);
  const userRestaurantId = useAuthStore((state) => state.user?.restaurantId);
  const { restaurants, fetchRestaurants } = useRestaurantStore();

  useEffect(() => {
    // Solo carga todos los restaurantes si es ADMIN GLOBAL
    if (userRole === 'PLATFORM_ADMIN') {
      fetchRestaurants(1, 100);
      fetchIngredients(filters.restaurantId || null);
    } else if (userRestaurantId) {
      fetchIngredients(userRestaurantId);
    }
  }, [userRole, userRestaurantId, fetchIngredients, fetchRestaurants, filters.restaurantId]);

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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
      
      {userRole === 'PLATFORM_ADMIN' && (
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurante</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4F4F]"
            value={filters.restaurantId || ''}
            onChange={(e) => setFilter('restaurantId', e.target.value)}
          >
            <option value="">Todos los restaurantes</option>
            {restaurants.map(r => (
              <option key={r._id} value={r._id}>{r.nombre || r.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4F4F]"
          value={filters.from}
          onChange={(e) => setFilter('from', e.target.value)}
        />
      </div>
      
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4F4F]"
          value={filters.to}
          onChange={(e) => setFilter('to', e.target.value)}
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Mov.</label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4F4F]"
          value={filters.tipo}
          onChange={(e) => setFilter('tipo', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="ENTRADA">Entrada</option>
          <option value="SALIDA">Salida</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Insumo</label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D4F4F]"
          value={filters.inventoryId}
          onChange={(e) => setFilter('inventoryId', e.target.value)}
        >
          <option value="">Todos</option>
          {ingredients.map(ing => (
            <option key={ing._id} value={ing._id}>{ing.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-[#2D4F4F] text-white rounded-lg hover:bg-[#1A3A3A] transition-colors"
        >
          Buscar
        </button>
      </div>
    </div>
  );
};
