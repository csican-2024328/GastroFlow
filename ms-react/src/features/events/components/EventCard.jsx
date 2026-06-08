import { useState } from 'react';
import toast from 'react-hot-toast';
import { useEventStore } from '../store/useEventStore.js';
 
export const EventCard = ({ event, onEventUsed, delay = 0 }) => {
  const [isLoading, setIsLoading] = useState(false);
  const useEventAction = useEventStore((s) => s.useEventAction);
 
  const isActive   = event.estado === 'ACTIVO';
  const isUpcoming = event.estado === 'PRÓXIMO';
  const hasBeenUsed = event.usado === true;
 
  const formatDate = (date) => {
    if (!date) return 'No especificada';
    return new Date(date).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  };
 
  const handleUseEvent = async () => {
    setIsLoading(true);
    const result = await useEventAction(event._id);
    setIsLoading(false);
    if (result.success) {
      toast.success('¡Evento utilizado correctamente!');
      if (onEventUsed) onEventUsed(event._id);
    } else {
      toast.error(result.error || 'Error al usar el evento');
    }
  };
 
  return (
    <article className={`ev-card${hasBeenUsed?' ev-card--used':''}`} style={{ animationDelay:`${delay}s` }}>
 
      {/* Imagen */}
      <div className="ev-card-img">
        {event.imagen && event.imagen !== '' ? (
          <img src={event.imagen} alt={event.nombre} />
        ) : (
          <div className="ev-card-img-fallback">🎉</div>
        )}
        <div className="ev-card-badge">
          {isActive    && !hasBeenUsed && <span className="ev-card-badge-activo"><i className="ti ti-check" style={{fontSize:9}} aria-hidden="true" />Activo</span>}
          {isUpcoming  && !hasBeenUsed && <span className="ev-card-badge-proximo"><i className="ti ti-clock" style={{fontSize:9}} aria-hidden="true" />Próximamente</span>}
          {hasBeenUsed && <span className="ev-card-badge-usado"><i className="ti ti-circle-check" style={{fontSize:9}} aria-hidden="true" />Utilizado</span>}
        </div>
      </div>
 
      {/* Cuerpo */}
      <div className="ev-card-body">
        <div>
          <h3 className="ev-card-name">{event.nombre}</h3>
          <p className="ev-card-desc">{event.descripcion||'Sin descripción disponible'}</p>
        </div>
 
        <div className="ev-card-dates">
          <div className="ev-card-date-row">
            <i className="ti ti-calendar-event" aria-hidden="true" />
            <span><span className="ev-card-date-label">Inicio:</span> {formatDate(event.fechaInicio)}</span>
          </div>
          <div className="ev-card-date-row">
            <i className="ti ti-calendar-event" aria-hidden="true" />
            <span><span className="ev-card-date-label">Fin:</span> {formatDate(event.fechaFin)}</span>
          </div>
        </div>
 
        {(isActive || isUpcoming) && !hasBeenUsed ? (
          <button onClick={handleUseEvent} disabled={isLoading} className="ev-card-use-btn">
            {isLoading
              ? <><span style={{width:13,height:13,border:'2px solid rgba(10,10,8,.25)',borderTopColor:'#0a0a08',borderRadius:'50%',animation:'ev-spin .7s linear infinite',flexShrink:0}} />Procesando...</>
              : <><i className="ti ti-bolt" aria-hidden="true" />Usar evento</>}
          </button>
        ) : hasBeenUsed ? (
          <div className="ev-card-used-msg">Evento ya utilizado</div>
        ) : null}
      </div>
    </article>
  );
};