import React, { useEffect } from 'react';
import { AuditFilters } from '../components/AuditFilters.jsx';
import { AuditTable } from '../components/AuditTable.jsx';
import { AuditDetailModal } from '../components/AuditDetailModal.jsx';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';

export const InventoryAuditPage = () => {
  const fetchMovements = useInventoryAuditStore(state => state.fetchMovements);
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();

  useEffect(() => {
    if (isRestaurantAdmin && !restaurantId) {
      return;
    }
    fetchMovements(restaurantId || null);
  }, [fetchMovements, isRestaurantAdmin, restaurantId]);

  if (isRestaurantAdmin && !hasRestaurantAssigned) {
    return <NoRestaurantAssigned />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D4F4F]">Auditoría de Inventario</h1>
        <p className="text-gray-500 mt-2">
          Consulta el historial completo de movimientos (entradas y salidas) del inventario.
        </p>
      </div>

      <AuditFilters />
      <AuditTable />
      <AuditDetailModal />
    </div>
  );
};
