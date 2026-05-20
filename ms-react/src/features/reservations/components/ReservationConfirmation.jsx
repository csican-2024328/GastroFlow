import { useEffect } from 'react';
 
export const ReservationConfirmation = ({ reservation, restaurant, onClose }) => {
  /* ── Auto-close — INTACTO ── */
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
 
  const formatDate = (ds) => new Date(ds).toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const formatTime = (ts) => ts.slice(0,5).replace(':','h');
 
  const isPending = reservation?.estado === 'PENDIENTE';
 
  return (
    <div className="rvc-overlay">
      <div className="rvc-modal">
 
        {/* Icono */}
        <div className={`rvc-icon-wrap${isPending?' rvc-icon-wrap--pending':' rvc-icon-wrap--success'}`}>
          <i className={`ti ${isPending?'ti-clock':'ti-check'}`} aria-hidden="true" />
        </div>
 
        {/* Título */}
        <h2 className="rvc-title">{isPending ? '⏳ Reservación Recibida' : '¡Reserva Confirmada!'}</h2>
        <p className="rvc-sub">
          {isPending
            ? 'Tu reservación está siendo revisada por un administrador. Recibirás un email de confirmación pronto.'
            : 'Tu reserva ha sido registrada exitosamente.'}
        </p>
 
        {/* Resumen */}
        <div className="rvc-summary">
          <div className="rvc-summary-single">
            <div className="rvc-s-label">Restaurante</div>
            <div className="rvc-s-value">{restaurant?.name}</div>
          </div>
          <div className="rvc-summary-row">
            <div>
              <div className="rvc-s-label">Fecha</div>
              <div className="rvc-s-value">{formatDate(reservation.date||reservation.fecha)}</div>
            </div>
            <div>
              <div className="rvc-s-label">Hora</div>
              <div className="rvc-s-value">{formatTime(reservation.timeStart||reservation.horaInicio)} – {formatTime(reservation.timeEnd||reservation.horaFin)}</div>
            </div>
          </div>
          <div className="rvc-summary-row">
            <div>
              <div className="rvc-s-label">Personas</div>
              <div className="rvc-s-value">{reservation.partySize||reservation.personas}</div>
            </div>
            <div>
              <div className="rvc-s-label">Mesa</div>
              <div className="rvc-s-value">Mesa {reservation.tableId?.numero||reservation.mesa?.numero}</div>
            </div>
          </div>
          <div>
            <div className="rvc-s-label">Número de Reserva</div>
            <div className="rvc-code">
              {reservation._id?.substring(reservation._id.length-8).toUpperCase()||reservation.confirmationCode||'RES-'+new Date().getTime()}
            </div>
          </div>
        </div>
 
        {/* Info box */}
        <div className={`rvc-info-box${isPending?' rvc-info-box--pending':' rvc-info-box--success'}`}>
          <i className={`ti ${isPending?'ti-clock':'ti-map-pin'}`} aria-hidden="true" />
          <span>
            {isPending
              ? <><strong style={{color:'var(--rv-text-primary)'}}>Tu reservación está bajo observación:</strong> Un administrador la revisará pronto. NO confirmes tu asistencia hasta recibir el email de aprobación.</>
              : <><strong style={{color:'var(--rv-text-primary)'}}>Importante:</strong> Por favor, llega con 15 minutos de anticipación. Tu reserva se mantendrá por 30 minutos después de la hora de inicio.</>}
          </span>
        </div>
 
        {/* Email */}
        <div className="rvc-email-box">
          <i className="ti ti-mail" aria-hidden="true" />
          {isPending
            ? 'Te hemos enviado un correo notificándote que tu reservación está siendo revisada'
            : 'Se ha enviado un correo de confirmación a tu email'}
        </div>
 
        <button onClick={onClose} className="rvc-continue-btn">Continuar</button>
      </div>
    </div>
  );
};