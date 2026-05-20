export const ConfirmationModal = ({
  isOpen, admin, restaurant, currentAssignment,
  onConfirm, onCancel, loading,
}) => {
  if (!isOpen) return null;
 
  const adminFullName  = `${admin?.Name||''} ${admin?.Surname||''}`.trim();
  const restaurantName = restaurant?.nombre||'';
 
  return (
    <div className="as-overlay">
      <div className="as-modal as-modal--sm">
 
        {/* Header */}
        <div className="as-modal-header">
          <div>
            <div className="as-modal-title">Confirmar Asignación</div>
            <div className="as-modal-sub">Esta acción es reversible — solo Platform Admins pueden asignar</div>
          </div>
          <button onClick={onCancel} className="as-modal-close" aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Body */}
        <div className="as-modal-body">
          <div className="as-confirm-center">
            <div className="as-confirm-icon-wrap">
              <i className="ti ti-alert-triangle" aria-hidden="true" />
            </div>
            <div className="as-confirm-title">¿Estás seguro?</div>
            <div className="as-confirm-question">
              Asignar a <strong>{adminFullName}</strong> como administrador de <strong>{restaurantName}</strong>
            </div>
          </div>
 
          {currentAssignment && (
            <div className="as-warning-box">
              <i className="ti ti-info-circle" aria-hidden="true" />
              <span>
                <strong>Nota:</strong> Este administrador ya tenía asignado{' '}
                <strong>{currentAssignment.nombre||currentAssignment}</strong>. Esta acción reemplazará la asignación anterior.
              </span>
            </div>
          )}
 
          <div className="as-confirm-info-grid">
            <div className="as-confirm-info-item">
              <div className="as-confirm-info-label">Administrador</div>
              <div className="as-confirm-info-value">{adminFullName}</div>
              {admin?.Email && <div className="as-confirm-info-sub">{admin.Email}</div>}
            </div>
            <div className="as-confirm-info-item">
              <div className="as-confirm-info-label">Restaurante</div>
              <div className="as-confirm-info-value">{restaurantName}</div>
              {restaurant?.ciudad && <div className="as-confirm-info-sub">{restaurant.ciudad}</div>}
            </div>
          </div>
 
          <div className="as-confirm-msg">
            Solo los administradores de plataforma pueden asignar restaurantes a otros administradores.
          </div>
        </div>
 
        {/* Footer */}
        <div className="as-modal-footer">
          <button onClick={onCancel} disabled={loading} className="as-btn as-btn-ghost">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="as-btn as-btn-confirm">
            {loading
              ? <><span className="as-btn-spinner as-btn-spinner--orange" />Asignando...</>
              : <><i className="ti ti-check" aria-hidden="true" />Sí, asignar</>}
          </button>
        </div>
      </div>
    </div>
  );
};
 