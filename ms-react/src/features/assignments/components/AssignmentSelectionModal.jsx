import { useState } from 'react';
import { Notyf } from 'notyf';
 
/* ── Notyf — INTACTO ── */
const notyf = new Notyf({
  duration: 3000,
  position: { x:'right', y:'top' },
  types: [
    { type:'success', background:'#69A77F', icon:false },
    { type:'error',   background:'#D1574F', icon:false },
  ],
});
 
export const AssignmentSelectionModal = ({
  isOpen, platformAdmins, restaurants,
  selectedAdmin, selectedRestaurant,
  onSelectAdmin, onSelectRestaurant,
  onConfirm, onCancel, loading,
}) => {
  const [searchAdminTerm,      setSearchAdminTerm]      = useState('');
  const [searchRestaurantTerm, setSearchRestaurantTerm] = useState('');
 
  if (!isOpen) return null;
 
  const filteredAdmins = platformAdmins.filter(a =>
    a.Name?.toLowerCase().includes(searchAdminTerm.toLowerCase()) ||
    a.Email?.toLowerCase().includes(searchAdminTerm.toLowerCase())
  );
  const filteredRestaurants = restaurants.filter(r =>
    r.nombre?.toLowerCase().includes(searchRestaurantTerm.toLowerCase())
  );
 
  const handleConfirm = () => {
    if (!selectedAdmin)      { notyf.error('Debes seleccionar un administrador'); return; }
    if (!selectedRestaurant) { notyf.error('Debes seleccionar un restaurante');   return; }
    onConfirm();
  };
 
  return (
    <div className="as-overlay">
      <div className="as-modal">
 
        {/* Header */}
        <div className="as-modal-header">
          <div>
            <div className="as-modal-title">Nueva Asignación</div>
            <div className="as-modal-sub">Selecciona un administrador y el restaurante al que deseas asignarlo.</div>
          </div>
          <button onClick={onCancel} className="as-modal-close" aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Body — grid 2 columnas */}
        <div className="as-modal-body">
          <div className="as-selection-grid">
 
            {/* Columna 1: Admin */}
            <div className="as-selection-col">
              <div className="as-selection-step">
                <div className="as-step-num">1</div>
                <div>
                  <div className="as-step-title">Selecciona un Administrador</div>
                  <div className="as-step-desc">Elige el administrador que deseas asignar.</div>
                </div>
              </div>
              <div className="as-sel-search-wrap">
                <i className="ti ti-search as-sel-search-icon" aria-hidden="true" />
                <input type="text" placeholder="Buscar administrador..." value={searchAdminTerm} onChange={e => setSearchAdminTerm(e.target.value)} className="as-sel-search-input" />
              </div>
              <div className="as-sel-list">
                {filteredAdmins.length === 0 ? (
                  <div className="as-sel-empty">No hay administradores</div>
                ) : filteredAdmins.map(admin => (
                  <div
                    key={admin.Id}
                    onClick={() => onSelectAdmin(admin)}
                    className={`as-sel-item${selectedAdmin?.Id===admin.Id?' selected':''}`}
                  >
                    <div className="as-sel-item-inner">
                      <div className="as-sel-item-avatar">
                        {admin.Name?.[0]}{admin.Surname?.[0]}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="as-sel-item-name">{admin.Name} {admin.Surname}</div>
                        <div className="as-sel-item-sub">{admin.Email}</div>
                      </div>
                    </div>
                    {selectedAdmin?.Id===admin.Id && <i className="ti ti-check as-sel-check" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>
 
            {/* Columna 2: Restaurante */}
            <div className="as-selection-col">
              <div className="as-selection-step">
                <div className="as-step-num">2</div>
                <div>
                  <div className="as-step-title">Selecciona un Restaurante</div>
                  <div className="as-step-desc">Elige el restaurante al que deseas asignar el administrador.</div>
                </div>
              </div>
              <div className="as-sel-search-wrap">
                <i className="ti ti-search as-sel-search-icon" aria-hidden="true" />
                <input type="text" placeholder="Buscar restaurante..." value={searchRestaurantTerm} onChange={e => setSearchRestaurantTerm(e.target.value)} className="as-sel-search-input" />
              </div>
              <div className="as-sel-list">
                {filteredRestaurants.length === 0 ? (
                  <div className="as-sel-empty">No hay restaurantes</div>
                ) : filteredRestaurants.map(restaurant => (
                  <div
                    key={restaurant._id}
                    onClick={() => onSelectRestaurant(restaurant)}
                    className={`as-sel-item${selectedRestaurant?._id===restaurant._id?' selected':''}`}
                  >
                    <div className="as-sel-item-inner">
                      <div className="as-sel-item-avatar as-sel-item-avatar--rest">🏪</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="as-sel-item-name">{restaurant.nombre}</div>
                        <div className="as-sel-item-sub">{restaurant.ciudad||'Sin ubicación'}</div>
                      </div>
                    </div>
                    {selectedRestaurant?._id===restaurant._id && <i className="ti ti-check as-sel-check" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Summary bar */}
          {selectedAdmin && selectedRestaurant && (
            <div className="as-summary-bar">
              <div className="as-summary-side">
                <div className="as-summary-label">Administrador</div>
                <div className="as-summary-value">{selectedAdmin.Name} {selectedAdmin.Surname}</div>
              </div>
              <i className="ti ti-arrow-right as-summary-arrow" aria-hidden="true" />
              <div className="as-summary-side">
                <div className="as-summary-label">Será administrador de</div>
                <div className="as-summary-value">{selectedRestaurant.nombre}</div>
              </div>
            </div>
          )}
        </div>
 
        {/* Footer */}
        <div className="as-modal-footer">
          <button onClick={onCancel} disabled={loading} className="as-btn as-btn-ghost">Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAdmin||!selectedRestaurant||loading}
            className="as-btn as-btn-primary"
          >
            {loading ? <><span className="as-btn-spinner" />Cargando...</> : <><i className="ti ti-arrow-right" aria-hidden="true" />Continuar con la Asignación</>}
          </button>
        </div>
      </div>
    </div>
  );
};