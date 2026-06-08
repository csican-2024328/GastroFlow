import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useReservationStore } from '../store/useReservationStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import '../../../styles/reservations.css';
 
/* ── Helpers — INTACTOS ── */
const formatFecha = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d) ? '-' : d.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' });
};
 
const getMesaLabel = (reservation) => {
  const ubicacion = reservation.mesaID?.ubicacion || reservation.mesaID?.identificador || '';
  const numero    = reservation.mesaID?.numero    ?? reservation.mesaID?.number ?? '';
  if (ubicacion && numero) return `${ubicacion} - ${numero}`;
  if (numero)              return `Mesa ${numero}`;
  return '-';
};
 
const STATUS_CSS = {
  CONFIRMADA: 'rv-status-badge--confirmada',
  PENDIENTE:  'rv-status-badge--pendiente',
  CANCELADA:  'rv-status-badge--cancelada',
  COMPLETADA: 'rv-status-badge--completada',
};
const STATUS_LABEL = { CONFIRMADA:'Aceptada', PENDIENTE:'Pendiente', CANCELADA:'Rechazada', COMPLETADA:'Completada' };
const STATUS_ICON  = { CONFIRMADA:'ti-check', PENDIENTE:'ti-clock', CANCELADA:'ti-x', COMPLETADA:'ti-circle-check' };
 
/* Paginación */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  if (totalPages <= 7) { for (let i=1;i<=totalPages;i++) pages.push(i); }
  else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i=Math.max(2,currentPage-1); i<=Math.min(totalPages-1,currentPage+1); i++) pages.push(i);
    if (currentPage < totalPages-2) pages.push('...');
    pages.push(totalPages);
  }
  return (
    <div className="rv-pagination">
      <button onClick={() => onPageChange(currentPage-1)} disabled={currentPage===1} className="rv-page-btn" aria-label="Anterior">
        <i className="ti ti-chevron-left" style={{fontSize:13}} aria-hidden="true" />
      </button>
      {pages.map((p,i) => p==='...'
        ? <span key={`d-${i}`} className="rv-page-dots">…</span>
        : <button key={p} onClick={() => onPageChange(p)} className={`rv-page-btn${p===currentPage?' rv-page-btn--active':''}`}>{p}</button>
      )}
      <button onClick={() => onPageChange(currentPage+1)} disabled={currentPage===totalPages} className="rv-page-btn" aria-label="Siguiente">
        <i className="ti ti-chevron-right" style={{fontSize:13}} aria-hidden="true" />
      </button>
    </div>
  );
};
 
/* ═══════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════ */
const ReservationManagement = () => {
  const { restaurantId, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
  const { reservations, loading, pagination, fetchUserReservations, approveOrRejectReservationAction } = useReservationStore();
 
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal]   = useState({ open:false, reservation:null });
  const [rejectModal,  setRejectModal]    = useState({ open:false, reservation:null });
  const [rejectReason, setRejectReason]   = useState('');
  const [sortOrder,    setSortOrder]      = useState('desc');
 
  useEffect(() => {
    fetchUserReservations(pagination.currentPage, pagination.limit, null, restaurantId||undefined);
  }, [pagination.currentPage, pagination.limit, fetchUserReservations, restaurantId]);
 
  if (isRestaurantAdmin && !hasRestaurantAssigned) return <NoRestaurantAssigned />;
 
  const handlePageChange = (page) => {
    if (page<1 || page>pagination.totalPages) return;
    fetchUserReservations(page, pagination.limit, null, restaurantId||undefined);
  };
 
  const aceptadas  = reservations.filter(r => r.estado==='CONFIRMADA').length;
  const rechazadas = reservations.filter(r => r.estado==='CANCELADA').length;
  const pendientes = reservations.filter(r => r.estado==='PENDIENTE').length;
 
  const sortedReservations = [...reservations].sort((a,b) => {
    const da = new Date(a.fechaReserva), db = new Date(b.fechaReserva);
    return sortOrder==='asc' ? da-db : db-da;
  });
 
  const handleConfirm = async () => {
    if (!confirmModal.reservation) return;
    setActionLoading(true);
    const result = await approveOrRejectReservationAction(confirmModal.reservation._id, {
      accion: 'APROBAR', clienteEmail: confirmModal.reservation.clienteEmail,
    });
    setActionLoading(false);
    if (result.success) {
      toast.success('Reservación confirmada correctamente');
      setConfirmModal({ open:false, reservation:null });
      fetchUserReservations(pagination.currentPage, pagination.limit, null, restaurantId||undefined);
    } else { toast.error(result.error||'Error al confirmar reservación'); }
  };
 
  const handleReject = async () => {
    if (!rejectModal.reservation) return;
    setActionLoading(true);
    const result = await approveOrRejectReservationAction(rejectModal.reservation._id, {
      accion:'RECHAZAR', razon:rejectReason, clienteEmail:rejectModal.reservation.clienteEmail,
    });
    setActionLoading(false);
    if (result.success) {
      toast.success('Reservación rechazada');
      setRejectModal({ open:false, reservation:null }); setRejectReason('');
      fetchUserReservations(pagination.currentPage, pagination.limit, null, restaurantId||undefined);
    } else { toast.error(result.error||'Error al rechazar reservación'); }
  };
 
  return (
    <div className="rv-root">
 
      {/* HEADER */}
      <div className="rv-header">
        <div className="rv-header-badge"><i className="ti ti-calendar-event" aria-hidden="true" />Gestión de reservaciones</div>
        <h1 className="rv-header-title">Administración de Reservaciones</h1>
        <p className="rv-header-sub">Gestiona y actualiza el estado de las reservaciones.</p>
      </div>
 
      {/* STATS */}
      <div className="rv-stats">
        <div className="rv-stat rv-stat--green">
          <div className="rv-stat-icon-wrap rv-stat-icon-wrap--green"><i className="ti ti-check" aria-hidden="true" /></div>
          <div className="rv-stat-info">
            <div className="rv-stat-label">Aceptadas</div>
            <div className={`rv-stat-value rv-stat-value--green`}>{aceptadas}</div>
            <div className="rv-stat-sublabel">Reservaciones confirmadas</div>
          </div>
        </div>
        <div className="rv-stat rv-stat--red">
          <div className="rv-stat-icon-wrap rv-stat-icon-wrap--red"><i className="ti ti-x" aria-hidden="true" /></div>
          <div className="rv-stat-info">
            <div className="rv-stat-label">Rechazadas</div>
            <div className={`rv-stat-value rv-stat-value--red`}>{rechazadas}</div>
            <div className="rv-stat-sublabel">Reservaciones rechazadas</div>
          </div>
        </div>
        <div className="rv-stat rv-stat--amber">
          <div className="rv-stat-icon-wrap rv-stat-icon-wrap--amber"><i className="ti ti-clock" aria-hidden="true" /></div>
          <div className="rv-stat-info">
            <div className="rv-stat-label">Pendientes</div>
            <div className={`rv-stat-value rv-stat-value--amber`}>{pendientes}</div>
            <div className="rv-stat-sublabel">Reservaciones por confirmar</div>
          </div>
        </div>
      </div>
 
      {/* TABLA */}
      <div className="rv-section">
        <div style={{ overflowX:'auto' }}>
          <table className="rv-table">
            <thead>
              <tr>
                <th>
                  <button className="rv-sort-btn" onClick={() => setSortOrder(o => o==='asc'?'desc':'asc')}>
                    Fecha <i className={`ti ${sortOrder==='asc'?'ti-sort-ascending':'ti-sort-descending'}`} aria-hidden="true" />
                  </button>
                </th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Mesa</th>
                <th style={{textAlign:'center'}}>Personas</th>
                <th>Estado</th>
                <th>Notas</th>
                <th style={{textAlign:'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{padding:0}}>
                  <div className="rv-table-loading"><div className="rv-table-spinner" />Cargando reservaciones...</div>
                </td></tr>
              ) : sortedReservations.length === 0 ? (
                <tr><td colSpan="8" style={{padding:0}}>
                  <div className="rv-table-empty">
                    <i className="ti ti-calendar-off" aria-hidden="true" />
                    No hay reservaciones disponibles
                  </div>
                </td></tr>
              ) : (
                sortedReservations.map((reservation, idx) => {
                  const actionable = reservation.estado==='PENDIENTE';
                  return (
                    <tr key={reservation._id||idx} style={{ animationDelay:`${idx*.03}s` }}>
                      <td className="rv-td-main">{formatFecha(reservation.fechaReserva)}</td>
                      <td>{reservation.horaInicio||'-'}</td>
                      <td>{reservation.horaFin||'-'}</td>
                      <td>{getMesaLabel(reservation)}</td>
                      <td className="rv-td-center">{reservation.cantidadPersonas??'-'}</td>
                      <td>
                        <span className={`rv-status-badge ${STATUS_CSS[reservation.estado]||'rv-status-badge--pendiente'}`}>
                          <i className={`ti ${STATUS_ICON[reservation.estado]||'ti-clock'}`} aria-hidden="true" />
                          {STATUS_LABEL[reservation.estado]||reservation.estado}
                        </span>
                      </td>
                      <td style={{maxWidth:140, overflow:'hidden', textOverflow:'ellipsis'}}>{reservation.notas||'–'}</td>
                      <td>
                        <div className="rv-action-btns">
                          <button
                            className="rv-action-btn rv-action-btn--accept"
                            onClick={() => setConfirmModal({open:true, reservation})}
                            disabled={!actionable}
                            title={actionable?'Aceptar':'No modificable'}
                            aria-label="Aceptar"
                          >
                            <i className="ti ti-check" aria-hidden="true" />
                          </button>
                          <button
                            className="rv-action-btn rv-action-btn--reject"
                            onClick={() => { setRejectModal({open:true, reservation}); setRejectReason(''); }}
                            disabled={!actionable}
                            title={actionable?'Rechazar':'No modificable'}
                            aria-label="Rechazar"
                          >
                            <i className="ti ti-x" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
 
        {/* Footer paginación */}
        <div className="rv-table-footer">
          <span className="rv-table-footer-info">
            Mostrando {Math.min((pagination.currentPage-1)*pagination.limit+1, pagination.totalRecords)} a {Math.min(pagination.currentPage*pagination.limit, pagination.totalRecords)} de {pagination.totalRecords} reservaciones
          </span>
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
 
      {/* MODAL CONFIRMAR */}
      {confirmModal.open && confirmModal.reservation && (
        <div className="rv-overlay">
          <div className="rv-modal">
            <div className="rv-modal-header">
              <div className="rv-modal-header-left">
                <div className="rv-modal-icon rv-modal-icon--green"><i className="ti ti-check" aria-hidden="true" /></div>
                <div><div className="rv-modal-title">Confirmar Reservación</div><div className="rv-modal-sub">Esta acción notificará al cliente</div></div>
              </div>
              <button onClick={() => setConfirmModal({open:false,reservation:null})} className="rv-modal-close" aria-label="Cerrar"><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="rv-modal-body">
              <p style={{fontSize:12,color:'var(--rv-text-secondary)',marginBottom:14}}>¿Estás seguro de que deseas <strong style={{color:'var(--rv-green)'}}>aceptar</strong> esta reservación?</p>
              <div className="rv-info-grid">
                <div className="rv-info-item"><div className="rv-info-label">Cliente</div><div className="rv-info-value">{confirmModal.reservation.clienteNombre||'-'}</div></div>
                <div className="rv-info-item"><div className="rv-info-label">Fecha</div><div className="rv-info-value">{formatFecha(confirmModal.reservation.fechaReserva)}</div></div>
                <div className="rv-info-item"><div className="rv-info-label">Horario</div><div className="rv-info-value">{confirmModal.reservation.horaInicio} – {confirmModal.reservation.horaFin}</div></div>
                <div className="rv-info-item"><div className="rv-info-label">Mesa</div><div className="rv-info-value">{getMesaLabel(confirmModal.reservation)}</div></div>
              </div>
            </div>
            <div className="rv-modal-footer">
              <button onClick={() => setConfirmModal({open:false,reservation:null})} className="rv-btn rv-btn-ghost">Cancelar</button>
              <button onClick={handleConfirm} disabled={actionLoading} className="rv-btn rv-btn-confirm">
                {actionLoading ? <><span className="rv-btn-spinner rv-btn-spinner--green" />Confirmando...</> : <><i className="ti ti-check" aria-hidden="true" />Confirmar</>}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* MODAL RECHAZAR */}
      {rejectModal.open && rejectModal.reservation && (
        <div className="rv-overlay">
          <div className="rv-modal">
            <div className="rv-modal-header">
              <div className="rv-modal-header-left">
                <div className="rv-modal-icon rv-modal-icon--red"><i className="ti ti-x" aria-hidden="true" /></div>
                <div><div className="rv-modal-title">Rechazar Reservación</div><div className="rv-modal-sub">Esto notificará al cliente</div></div>
              </div>
              <button onClick={() => setRejectModal({open:false,reservation:null})} className="rv-modal-close" aria-label="Cerrar"><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="rv-modal-body">
              <p style={{fontSize:12,color:'var(--rv-text-secondary)',marginBottom:14}}>¿Estás seguro de que deseas <strong style={{color:'var(--rv-red)'}}>rechazar</strong> esta reservación?</p>
              <div className="rv-info-grid" style={{marginBottom:14}}>
                <div className="rv-info-item"><div className="rv-info-label">Cliente</div><div className="rv-info-value">{rejectModal.reservation.clienteNombre||'-'}</div></div>
                <div className="rv-info-item"><div className="rv-info-label">Mesa</div><div className="rv-info-value">{getMesaLabel(rejectModal.reservation)}</div></div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                <span style={{fontSize:9,color:'var(--rv-text-tertiary)',letterSpacing:'1.4px',textTransform:'uppercase',fontWeight:500}}>Motivo del rechazo (opcional)</span>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Sin disponibilidad, horario no válido, etc." rows={3} className="rv-textarea" />
              </div>
            </div>
            <div className="rv-modal-footer">
              <button onClick={() => setRejectModal({open:false,reservation:null})} className="rv-btn rv-btn-ghost">Volver</button>
              <button onClick={handleReject} disabled={actionLoading} className="rv-btn rv-btn-danger">
                {actionLoading ? <><span className="rv-btn-spinner rv-btn-spinner--red" />Rechazando...</> : <><i className="ti ti-x" aria-hidden="true" />Rechazar</>}
              </button>
            </div>
          </div>
        </div>
      )}
 
    </div>
  );
};
 
export default ReservationManagement;