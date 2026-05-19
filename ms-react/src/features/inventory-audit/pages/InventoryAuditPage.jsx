import React, { useEffect } from 'react';
import { AuditFilters } from '../components/AuditFilters.jsx';
import { AuditTable } from '../components/AuditTable.jsx';
import { AuditDetailModal } from '../components/AuditDetailModal.jsx';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import '../../../styles/inventory-audit.css';
 
export const InventoryAuditPage = () => {
  const fetchMovements = useInventoryAuditStore((state) => state.fetchMovements);
  const movements      = useInventoryAuditStore((state) => state.movements);
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
 
  /* ── Effect — INTACTO ── */
  useEffect(() => {
    if (isRestaurantAdmin && !restaurantId) return;
    fetchMovements(restaurantId || null);
  }, [fetchMovements, isRestaurantAdmin, restaurantId]);
 
  if (isRestaurantAdmin && !hasRestaurantAssigned) {
    return <NoRestaurantAssigned />;
  }
 
  /* Stats rápidas derivadas de los movimientos */
  const totalMov   = movements?.length ?? 0;
  const entradas   = movements?.filter((m) => m.tipo === 'ENTRADA').length ?? 0;
  const salidas    = movements?.filter((m) => m.tipo === 'SALIDA').length  ?? 0;
  const restaurantes = new Set(movements?.map((m) => m.restaurantId?._id || m.restaurantId).filter(Boolean)).size;
 
  return (
    <div className="ia-root">
 
      {/* HEADER */}
      <div className="ia-header">
        <div className="ia-header-badge">
          <i className="ti ti-clipboard-list" aria-hidden="true" />
          Control de inventario
        </div>
        <h1 className="ia-header-title">Auditoría de Inventario</h1>
        <p className="ia-header-sub">
          Consulta el historial completo de movimientos (entradas y salidas) del inventario.
        </p>
      </div>
 
      {/* STATS */}
      <div className="ia-stats">
        <div className="ia-stat ia-stat--gold">
          <div className="ia-stat-top">
            <div className="ia-stat-icon"><i className="ti ti-list-details" aria-hidden="true" /></div>
          </div>
          <div className="ia-stat-label">Total movimientos</div>
          <div className="ia-stat-value">{totalMov}</div>
        </div>
        <div className="ia-stat ia-stat--green">
          <div className="ia-stat-top">
            <div className="ia-stat-icon ia-stat-icon--g"><i className="ti ti-arrow-bar-to-down" aria-hidden="true" /></div>
          </div>
          <div className="ia-stat-label">Entradas</div>
          <div className="ia-stat-value ia-stat-value--green">{entradas}</div>
        </div>
        <div className="ia-stat ia-stat--red">
          <div className="ia-stat-top">
            <div className="ia-stat-icon ia-stat-icon--r"><i className="ti ti-arrow-bar-up" aria-hidden="true" /></div>
          </div>
          <div className="ia-stat-label">Salidas</div>
          <div className="ia-stat-value ia-stat-value--red">{salidas}</div>
        </div>
        <div className="ia-stat ia-stat--blue">
          <div className="ia-stat-top">
            <div className="ia-stat-icon ia-stat-icon--b"><i className="ti ti-building-store" aria-hidden="true" /></div>
          </div>
          <div className="ia-stat-label">Restaurantes</div>
          <div className="ia-stat-value ia-stat-value--blue">{restaurantes}</div>
        </div>
      </div>
 
      {/* FILTROS */}
      <AuditFilters />
 
      {/* TABLA */}
      <AuditTable />
 
      {/* MODAL DE DETALLE */}
      <AuditDetailModal />
 
    </div>
  );
};