import React from 'react';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
 
const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
};
 
export const AuditTable = () => {
  const { movements, loading, pagination, setPage, fetchMovements, fetchMovementDetail, filters } =
    useInventoryAuditStore();
  const userRole         = useAuthStore((state) => state.user?.role);
  const userRestaurantId = useAuthStore((state) => state.user?.restaurantId);
 
  /* ── Handler paginación — INTACTO ── */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const restId = userRole === 'PLATFORM_ADMIN' ? filters.restaurantId : userRestaurantId;
    fetchMovements(restId);
  };
 
  if (loading) {
    return (
      <div className="ia-section">
        <div className="ia-table-loading">
          <div className="ia-table-spinner" />
          Cargando movimientos...
        </div>
      </div>
    );
  }
 
  if (!movements || movements.length === 0) {
    return (
      <div className="ia-section">
        <div className="ia-table-empty">
          <i className="ti ti-clipboard-list" aria-hidden="true" />
          No se encontraron movimientos en el inventario.
        </div>
      </div>
    );
  }
 
  return (
    <div className="ia-section">
      <div style={{ overflowX: 'auto' }}>
        <table className="ia-table">
          <thead>
            <tr>
              <th style={{ width: '14%' }}>Fecha</th>
              {userRole === 'PLATFORM_ADMIN' && <th style={{ width: '16%' }}>Restaurante</th>}
              <th style={{ width: '22%' }}>Insumo</th>
              <th style={{ width: '12%' }}>Tipo</th>
              <th style={{ width: '14%' }}>Cantidad</th>
              <th style={{ width: '22%' }}>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((mov, idx) => (
              <tr
                key={mov._id}
                style={{ animationDelay: `${idx * 0.03}s` }}
                onClick={() => fetchMovementDetail(mov._id)}
                title="Clic para ver detalle"
              >
                <td className="ia-td-date">{formatDate(mov.createdAt)}</td>
                {userRole === 'PLATFORM_ADMIN' && (
                  <td>{mov.restaurantId?.nombre || mov.restaurantId?.name || 'Desconocido'}</td>
                )}
                <td className="ia-td-main">{mov.inventoryId?.nombre || 'Desconocido'}</td>
                <td>
                  <span className={`ia-tipo-badge ia-tipo-badge--${mov.tipo?.toLowerCase()}`}>
                    <i
                      className={`ti ${mov.tipo === 'ENTRADA' ? 'ti-arrow-bar-to-down' : 'ti-arrow-bar-up'}`}
                      style={{ fontSize: 9 }}
                      aria-hidden="true"
                    />
                    {mov.tipo}
                  </span>
                </td>
                <td className="ia-td-main">
                  {mov.cantidad}{' '}
                  <span style={{ fontSize: 10, color: 'var(--ia-text-tertiary)', fontWeight: 400 }}>
                    {mov.inventoryId?.unidadMedida || ''}
                  </span>
                </td>
                <td className="ia-td-user" title={mov.userId}>
                  {mov.userId || 'Sistema'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="ia-pagination">
          <span className="ia-pagination-info">
            Página {pagination.currentPage} de {pagination.totalPages}
            <span style={{ marginLeft: 6, color: 'var(--ia-text-hint)' }}>({pagination.total} registros)</span>
          </span>
          <div className="ia-pagination-btns">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="ia-page-btn"
            >
              <i className="ti ti-chevron-left" style={{ fontSize: 13 }} aria-hidden="true" />
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ia-page-btn"
            >
              Siguiente
              <i className="ti ti-chevron-right" style={{ fontSize: 13 }} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};