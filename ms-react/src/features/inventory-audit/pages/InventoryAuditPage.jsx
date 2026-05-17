import React, { useEffect } from 'react';
import { AuditFilters } from '../components/AuditFilters.jsx';
import { AuditTable } from '../components/AuditTable.jsx';
import { AuditDetailModal } from '../components/AuditDetailModal.jsx';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

export const InventoryAuditPage = () => {
  const fetchMovements = useInventoryAuditStore(state => state.fetchMovements);
  const userRole = useAuthStore(state => state.user?.role);
  const userRestaurantId = useAuthStore(state => state.user?.restaurantId);

  useEffect(() => {
    // Platform Admins fetch all movements (passing null/undefined for restaurantId)
    // Restaurant Admins fetch only their own
    const restId = userRole === 'PLATFORM_ADMIN' ? null : userRestaurantId;
    if (userRole === 'PLATFORM_ADMIN' || userRestaurantId) {
      fetchMovements(restId);
    }
  }, [userRole, userRestaurantId, fetchMovements]);

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
