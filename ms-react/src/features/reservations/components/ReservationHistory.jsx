import { useState } from 'react';
 
export const ReservationHistory = ({ reservations, onCancel, isLoading }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId]     = useState(null);
 
  /* ── Helpers — INTACTOS ── */
  const filteredReservations = filterStatus==='all'
    ? reservations
    : reservations.filter(r => r.estado?.toLowerCase() === filterStatus.toLowerCase());
 
  const STATUS_CSS   = { CONFIRMADA:'rv-status-badge--confirmada', CANCELADA:'rv-status-badge--cancelada', COMPLETADA:'rv-status-badge--completada' };
  const STATUS_LABEL = { CONFIRMADA:'Confirmada', CANCELADA:'Cancelada', COMPLETADA:'Completada' };
  const STATUS_ICON  = { CONFIRMADA:'ti-check', CANCELADA:'ti-x', COMPLETADA:'ti-circle-check' };
  const getStatusCss = (s) => STATUS_CSS[s?.toUpperCase()] || 'rv-status-badge--pendiente';
  const getStatusLabel = (s) => STATUS_LABEL[s?.toUpperCase()] || 'Pendiente';
  const getStatusIcon  = (s) => STATUS_ICON[s?.toUpperCase()] || 'ti-clock';
 
  const getTimeStatus = (reservationDate, reservationTime) => {
    const now = new Date();
    const dt = new Date(`${reservationDate}T${reservationTime}`);
    if (dt < now) return 'passed';
    if (dt.getTime() - now.getTime() < 60*60*1000) return 'soon';
    return 'upcoming';
  };
 
  const formatDate = (ds) => new Date(ds).toLocaleDateString('es-ES', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
  const formatTime = (ts) => { if (!ts) return 'No especificada'; return ts.slice(0,5).replace(':','h'); };
 
  const handleCancelReservation = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.')) {
      await onCancel(id);
    }
  };
 
  return (
    <div>
      {/* Filtros */}
      <div className="rvh-filters">
        {[
          { value:'all',       label:'Todas' },
          { value:'confirmada',label:'Confirmadas' },
          { value:'completada',label:'Completadas' },
          { value:'cancelada', label:'Canceladas' },
        ].map(filter => (
          <button key={filter.value} onClick={() => setFilterStatus(filter.value)} className={`rvh-filter-btn${filterStatus===filter.value?' active':''}`}>
            {filter.label}
          </button>
        ))}
      </div>
 
      {filteredReservations.length === 0 ? (
        <div className="rvh-empty">
          <span className="rvh-empty-icon">📭</span>
          <div className="rvh-empty-title">No hay reservas</div>
          <div className="rvh-empty-sub">
            {filterStatus==='all' ? '¡Aún no tienes reservas! Haz tu primera reserva.' : `No tienes reservas ${filterStatus}.`}
          </div>
        </div>
      ) : (
        <div className="rvh-list">
          {filteredReservations.map(reservation => {
            const timeStatus = getTimeStatus(reservation.fecha, reservation.horaInicio);
            const isExpanded = expandedId === reservation._id;
            return (
              <div key={reservation._id} className={`rvh-card${isExpanded?' expanded':''}`}>
                <button className="rvh-card-header" onClick={() => setExpandedId(isExpanded?null:reservation._id)}>
                  <div className="rvh-card-header-inner">
                    <div style={{flex:1}}>
                      <div className="rvh-card-name">{reservation.restaurante?.nombre||'Restaurante'}</div>
                      <div className="rvh-card-meta">
                        <i className="ti ti-calendar" aria-hidden="true" />
                        {formatDate(reservation.fecha)} · {formatTime(reservation.horaInicio)} – {formatTime(reservation.horaFin)}
                      </div>
                      <div className="rvh-card-badges">
                        <span className={`rv-status-badge ${getStatusCss(reservation.estado)}`}>
                          <i className={`ti ${getStatusIcon(reservation.estado)}`} aria-hidden="true" />
                          {getStatusLabel(reservation.estado)}
                        </span>
                        {timeStatus==='soon' && <span className="rvh-badge-soon">⏰ Próximamente</span>}
                        <span className="rvh-badge-people">
                          <i className="ti ti-users" aria-hidden="true" />
                          {reservation.personas} personas
                        </span>
                      </div>
                    </div>
                    <i className={`ti ${isExpanded?'ti-chevron-up':'ti-chevron-right'} rvh-card-toggle`} aria-hidden="true" />
                  </div>
                </button>
 
                {isExpanded && (
                  <div className="rvh-card-body">
                    <div className="rvh-detail-list">
                      <div className="rvh-detail-row">
                        <span className="rvh-detail-key"><i className="ti ti-hash" aria-hidden="true" />Número de reserva</span>
                        <span className="rvh-detail-val rvh-detail-val--mono">{reservation._id?.substring(reservation._id.length-8).toUpperCase()||'N/A'}</span>
                      </div>
                      <div className="rvh-detail-row">
                        <span className="rvh-detail-key"><i className="ti ti-armchair" aria-hidden="true" />Mesa asignada</span>
                        <span className="rvh-detail-val">{reservation.mesa?.numero||'Por asignar'}</span>
                      </div>
                      <div className="rvh-detail-row">
                        <span className="rvh-detail-key"><i className="ti ti-map-pin" aria-hidden="true" />Ubicación</span>
                        <span className="rvh-detail-val">{reservation.mesa?.ubicacion||'No especificada'}</span>
                      </div>
                      <div className="rvh-detail-row">
                        <span className="rvh-detail-key"><i className="ti ti-calendar-plus" aria-hidden="true" />Creada</span>
                        <span className="rvh-detail-val">{new Date(reservation.creadaEn).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
 
                    {reservation.notas && (
                      <div className="rvh-notes-box">
                        <strong>📝 Notas:</strong> {reservation.notas}
                      </div>
                    )}
 
                    {reservation.estado?.toUpperCase()==='CANCELADA' && reservation.razonCancelacion && (
                      <div className="rvh-cancel-box">
                        <strong>❌ Razón de cancelación:</strong> {reservation.razonCancelacion}
                      </div>
                    )}
 
                    <div className="rvh-card-actions">
                      {reservation.estado?.toUpperCase()==='CONFIRMADA' && timeStatus!=='passed' && (
                        <button onClick={() => handleCancelReservation(reservation._id)} disabled={isLoading} className="rvh-cancel-btn">
                          <i className="ti ti-trash" aria-hidden="true" />
                          Cancelar Reserva
                        </button>
                      )}
                      {reservation.estado?.toUpperCase()==='COMPLETADA' && (
                        <button className="rvh-review-btn">
                          <i className="ti ti-star" aria-hidden="true" />
                          Dejar Reseña
                        </button>
                      )}
                      <button onClick={() => setExpandedId(null)} className="rvh-close-btn">Cerrar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
 