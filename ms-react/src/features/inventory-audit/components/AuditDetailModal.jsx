import React from 'react';
import { useInventoryAuditStore } from '../store/useInventoryAuditStore.js';
 
const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
};
 
export const AuditDetailModal = () => {
  const { selectedMovement, clearDetail, detailLoading } = useInventoryAuditStore();
 
  if (!selectedMovement && !detailLoading) return null;
 
  return (
    <div className="iad-overlay" role="dialog" aria-modal="true" aria-label="Detalle del movimiento">
      <div className="iad-modal">
 
        {/* Header */}
        <div className="iad-header">
          <div className="iad-header-left">
            <div className="iad-header-icon">
              <i className="ti ti-clipboard-list" aria-hidden="true" />
            </div>
            <div>
              <div className="iad-header-title">Detalle del Movimiento</div>
              <div className="iad-header-sub">Información completa del registro de auditoría</div>
            </div>
          </div>
          <button onClick={clearDetail} className="iad-close" aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Body */}
        <div className="iad-body">
          {detailLoading ? (
            <div className="iad-loading">
              <div className="iad-loading-spinner" />
              Cargando detalle...
            </div>
          ) : (
            <div className="iad-grid">
 
              {/* Insumo */}
              <div className="iad-detail-item">
                <div className="iad-detail-label">
                  <i className="ti ti-carrot" aria-hidden="true" />
                  Insumo
                </div>
                <div className="iad-detail-value">
                  {selectedMovement.inventoryId?.nombre || 'Desconocido'}
                </div>
              </div>
 
              {/* Restaurante */}
              <div className="iad-detail-item">
                <div className="iad-detail-label">
                  <i className="ti ti-building-store" aria-hidden="true" />
                  Restaurante
                </div>
                <div className="iad-detail-value">
                  {selectedMovement.restaurantId?.nombre || selectedMovement.restaurantId?.name || 'Desconocido'}
                </div>
              </div>
 
              {/* Unidad */}
              <div className="iad-detail-item">
                <div className="iad-detail-label">
                  <i className="ti ti-ruler" aria-hidden="true" />
                  Unidad
                </div>
                <div className="iad-detail-value">
                  {selectedMovement.inventoryId?.unidadMedida || 'N/A'}
                </div>
              </div>
 
              {/* Tipo */}
              <div className="iad-detail-item">
                <div className="iad-detail-label">
                  <i className="ti ti-arrows-exchange" aria-hidden="true" />
                  Tipo
                </div>
                <div className="iad-detail-value">
                  <span className={`ia-tipo-badge ia-tipo-badge--${selectedMovement.tipo?.toLowerCase()}`}>
                    <i
                      className={`ti ${selectedMovement.tipo === 'ENTRADA' ? 'ti-arrow-bar-to-down' : 'ti-arrow-bar-up'}`}
                      style={{ fontSize: 9 }}
                      aria-hidden="true"
                    />
                    {selectedMovement.tipo}
                  </span>
                </div>
              </div>
 
              {/* Cantidad */}
              <div className="iad-detail-item">
                <div className="iad-detail-label">
                  <i className="ti ti-package" aria-hidden="true" />
                  Cantidad
                </div>
                <div className="iad-detail-value">{selectedMovement.cantidad}</div>
              </div>
 
              {/* Motivo */}
              <div className="iad-detail-item">
                <div className="iad-detail-label">
                  <i className="ti ti-notes" aria-hidden="true" />
                  Motivo
                </div>
                <div className={`iad-detail-value${!selectedMovement.motivo ? ' iad-detail-value--muted' : ''}`}>
                  {selectedMovement.motivo || 'N/A'}
                </div>
              </div>
 
              {/* Fecha */}
              <div className="iad-detail-item">
                <div className="iad-detail-label">
                  <i className="ti ti-calendar" aria-hidden="true" />
                  Fecha
                </div>
                <div className="iad-detail-value">{formatDateTime(selectedMovement.createdAt)}</div>
              </div>
 
              {/* Usuario */}
              <div className="iad-detail-item">
                <div className="iad-detail-label">
                  <i className="ti ti-user" aria-hidden="true" />
                  Registrado por
                </div>
                <div className={`iad-detail-value${!selectedMovement.userId ? ' iad-detail-value--muted' : ''}`}>
                  {selectedMovement.userId || 'Sistema'}
                </div>
              </div>
 
              {/* Orden relacionada */}
              {selectedMovement.orderId && (
                <div className="iad-detail-item iad-grid-full">
                  <div className="iad-detail-label">
                    <i className="ti ti-receipt" aria-hidden="true" />
                    Orden Relacionada
                  </div>
                  <div className="iad-detail-value">
                    <span className="iad-order-badge">
                      <i className="ti ti-hash" style={{ fontSize: 10 }} aria-hidden="true" />
                      {selectedMovement.orderId.numeroOrden}
                      <span style={{ opacity: .6, fontSize: 10 }}>· {selectedMovement.orderId.estado}</span>
                    </span>
                  </div>
                </div>
              )}
 
            </div>
          )}
        </div>
 
        {/* Footer */}
        {!detailLoading && (
          <div className="iad-footer">
            <button onClick={clearDetail} className="iad-btn-close">
              <i className="ti ti-x" aria-hidden="true" />
              Cerrar
            </button>
          </div>
        )}
 
      </div>
    </div>
  );
};
 