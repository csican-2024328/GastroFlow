import { useEffect, useMemo, useState } from 'react';
import { EventFilters } from '../components/EventFilters.jsx';
import { EventFormModal } from '../components/EventFormModal.jsx';
import { useEventStore } from '../store/useEventStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useRestaurantScope } from '../../../shared/hooks/useRestaurantScope.js';
import { NoRestaurantAssigned } from '../../../shared/components/layout/NoRestaurantAssigned.jsx';
import { notyfError, notyfSuccess } from '../../../shared/utils/notyf.js';
import '../../../styles/events.css';
 
/* ── Helpers — INTACTOS ── */
const getEventTypeLabel = (type) => ({
  PROMOCION:'Promoción', DESCUENTO:'Descuento', COMBO:'Combo',
  HAPPY_HOUR:'Happy Hour', EVENTO_ESPECIAL:'Evento Especial', OFERTA_TEMPORAL:'Oferta Temporal',
}[type]||type);
 
const getDiscountLabel = (tipo, valor) => tipo==='PORCENTAJE' ? `${valor}%` : `Q ${Number(valor).toFixed(2)}`;
 
const getEventStatus = (fechaInicio, fechaFin) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const s = new Date(fechaInicio); s.setHours(0,0,0,0);
  const e = new Date(fechaFin); e.setHours(0,0,0,0);
  if (today < s) return { label:'Próximamente', css:'ev-status-badge--proximo' };
  if (today > e) return { label:'Expirado',     css:'ev-status-badge--expirado' };
  return             { label:'Vigente',          css:'ev-status-badge--vigente' };
};
 
const fmtDate = (d) => new Date(d).toLocaleDateString('es-ES');
 
export const EventsAdminPage = () => {
  const { restaurantId, role, isRestaurantAdmin, hasRestaurantAssigned } = useRestaurantScope();
  const restaurants        = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants   = useRestaurantStore((s) => s.fetchRestaurants);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurantId||null);
 
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deletingId,    setDeletingId]    = useState(null);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [typeFilter,    setTypeFilter]    = useState('');
 
  const events                  = useEventStore((s) => s.events);
  const loading                 = useEventStore((s) => s.loading);
  const fetchRestaurantEvents   = useEventStore((s) => s.fetchRestaurantEvents);
  const deleteEventAction       = useEventStore((s) => s.deleteEventAction);
  const activateEventAction     = useEventStore((s) => s.activateEventAction);
  const deactivateEventAction   = useEventStore((s) => s.deactivateEventAction);
  const clearSelectedEvent      = useEventStore((s) => s.clearSelectedEvent);
 
  /* ── Filtrado — INTACTO ── */
  const filteredEvents = useMemo(() => {
    let result = [...events];
    if (searchTerm.trim()) { const q = searchTerm.trim().toLowerCase(); result = result.filter(e => e.nombre?.toLowerCase().includes(q)||e.descripcion?.toLowerCase().includes(q)); }
    if (statusFilter) result = result.filter(e => e.estado===statusFilter);
    if (typeFilter)   result = result.filter(e => e.tipo===typeFilter);
    return result;
  }, [events, searchTerm, statusFilter, typeFilter]);
 
  useEffect(() => { if (role==='PLATFORM_ADMIN') fetchRestaurants(1,50); }, [fetchRestaurants,role]);
  useEffect(() => { if (restaurantId) setSelectedRestaurantId(restaurantId); }, [restaurantId]);
  useEffect(() => { if (selectedRestaurantId) fetchRestaurantEvents(selectedRestaurantId); }, [fetchRestaurantEvents,selectedRestaurantId]);
 
  if (isRestaurantAdmin && !hasRestaurantAssigned) return <NoRestaurantAssigned />;
 
  /* ── Handlers — INTACTOS ── */
  const handleCreateEvent = () => { clearSelectedEvent(); setSelectedEvent(null); setIsModalOpen(true); };
  const handleEditEvent   = (ev) => { setSelectedEvent(ev); setIsModalOpen(true); };
  const handleCloseModal  = () => { setIsModalOpen(false); setSelectedEvent(null); clearSelectedEvent(); };
 
  const handleConfirmDelete = async () => {
    if (!eventToDelete?._id) return;
    setDeletingId(eventToDelete._id);
    const result = await deleteEventAction(eventToDelete._id);
    setDeletingId(null);
    if (result.success) { notyfSuccess('Evento eliminado correctamente'); setEventToDelete(null); }
    else notyfError(result.error||'Error al eliminar evento');
  };
 
  const handleToggleActive = async (ev) => {
    const isActive = ev.isActive !== false;
    const result   = isActive ? await deactivateEventAction(ev._id) : await activateEventAction(ev._id);
    if (result.success) notyfSuccess(isActive?'Evento desactivado':'Evento activado');
    else notyfError(result.error||'Error al cambiar estado del evento');
  };
 
  /* ── Selección de restaurante (Platform Admin) ── */
  if (!selectedRestaurantId && role==='PLATFORM_ADMIN') {
    return (
      <div className="ev-root">
        <div className="ev-header">
          <div>
            <div className="ev-header-badge"><i className="ti ti-calendar-event" aria-hidden="true" />Administración</div>
            <h1 className="ev-header-title">Selecciona un Restaurante</h1>
            <p className="ev-header-sub">Administrador, selecciona un restaurante para ver y gestionar sus eventos.</p>
          </div>
        </div>
        {restaurants.length === 0 ? (
          <div className="ev-empty-box">
            <span className="ev-empty-box-icon">🍽️</span>
            <div className="ev-empty-box-title">No hay restaurantes disponibles</div>
          </div>
        ) : (
          <div className="ev-restaurant-grid">
            {restaurants.map((restaurant, idx) => (
              <button key={restaurant._id} onClick={() => setSelectedRestaurantId(restaurant._id)} className="ev-restaurant-card" style={{animationDelay:`${idx*.05}s`}}>
                <div className="ev-restaurant-img">
                  {restaurant.fotos?.length>0 ? <img src={restaurant.fotos[0]} alt={restaurant.name} /> : <div className="ev-restaurant-no-img">🍽️</div>}
                </div>
                <div className="ev-restaurant-body">
                  <div className="ev-restaurant-name">{restaurant.name}</div>
                  <div className="ev-restaurant-cat">{restaurant.category||'Restaurante'}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
 
  if (loading && events.length===0) {
    return <div className="ev-loading"><div className="ev-spinner" />Cargando eventos...</div>;
  }
 
  const selectedRestaurant = restaurants.find(r => r._id===selectedRestaurantId);
 
  return (
    <div className="ev-root">
 
      {/* HEADER */}
      <div className="ev-header">
        <div>
          <div className="ev-header-badge"><i className="ti ti-calendar-event" aria-hidden="true" />Gestión de eventos</div>
          <h1 className="ev-header-title">Eventos{selectedRestaurant ? ` — ${selectedRestaurant.name}` : ''}</h1>
          <p className="ev-header-sub">Gestiona eventos especiales, promociones y descuentos.</p>
        </div>
        <div className="ev-header-actions">
          {role==='PLATFORM_ADMIN' && (
            <button onClick={() => setSelectedRestaurantId(null)} className="ev-btn-back ev-btn-back--gold">
              <i className="ti ti-arrow-left" aria-hidden="true" />Cambiar Restaurante
            </button>
          )}
          <button onClick={handleCreateEvent} className="ev-btn-new">
            <i className="ti ti-plus" aria-hidden="true" />+ Nuevo Evento
          </button>
        </div>
      </div>
 
      {/* FILTROS */}
      <EventFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        statusFilter={statusFilter} onStatusChange={setStatusFilter}
        typeFilter={typeFilter} onTypeChange={setTypeFilter}
      />
 
      {/* TABLA */}
      {filteredEvents.length > 0 ? (
        <div className="ev-section">
          <div className="ev-section-header">
            <span style={{fontSize:13,fontWeight:500,color:'var(--ev-text-primary)'}}>Lista de eventos</span>
            <span className="ev-section-count">{filteredEvents.length} evento{filteredEvents.length!==1?'s':''}</span>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="ev-table">
              <thead>
                <tr>
                  <th style={{width:'30%'}}>Nombre</th>
                  <th style={{width:'13%'}}>Tipo</th>
                  <th style={{width:'12%'}}>Descuento</th>
                  <th style={{width:'20%'}}>Vigencia</th>
                  <th style={{width:'10%'}} className="center">Estado</th>
                  <th style={{width:'15%'}} className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev, idx) => {
                  const statusInfo  = getEventStatus(ev.fechaInicio, ev.fechaFin);
                  const isActive    = ev.isActive !== false;
                  return (
                    <tr key={ev._id} style={{animationDelay:`${idx*.03}s`}}>
                      <td>
                        <div className="ev-event-name">{ev.nombre}</div>
                        <div className="ev-event-desc">{ev.descripcion?.substring(0,60)}{ev.descripcion?.length>60?'...':''}</div>
                        <div className="ev-event-pills">
                          {ev.platosAplicables?.length>0 && <span className="ev-event-pill"><i className="ti ti-tools-kitchen-2" style={{fontSize:10}} aria-hidden="true" /> {ev.platosAplicables.length} plato{ev.platosAplicables.length!==1?'s':''}</span>}
                          {ev.menusAplicables?.length>0  && <span className="ev-event-pill ev-event-pill--menus"><i className="ti ti-book" style={{fontSize:10}} aria-hidden="true" /> {ev.menusAplicables.length} menú{ev.menusAplicables.length!==1?'s':''}</span>}
                        </div>
                      </td>
                      <td><span className="ev-tipo-badge">{getEventTypeLabel(ev.tipo)}</span></td>
                      <td><span className="ev-discount-val">{getDiscountLabel(ev.descuentoTipo, ev.descuentoValor)}</span></td>
                      <td>
                        <div className="ev-date-range">{fmtDate(ev.fechaInicio)} – {fmtDate(ev.fechaFin)}</div>
                        <span className={`ev-status-badge ${statusInfo.css}`}>
                          <i className={`ti ${statusInfo.label==='Vigente'?'ti-check':statusInfo.label==='Próximamente'?'ti-clock':'ti-clock-off'}`} aria-hidden="true" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="ev-td-center">
                        <button
                          onClick={() => handleToggleActive(ev)}
                          disabled={loading}
                          className={`ev-toggle${isActive?' ev-toggle--on':' ev-toggle--off'}`}
                          title={isActive?'Desactivar':'Activar'}
                          aria-label={isActive?'Desactivar evento':'Activar evento'}
                        >
                          <span className="ev-toggle-thumb" />
                        </button>
                      </td>
                      <td>
                        <div className="ev-action-btns">
                          <button className="ev-action-btn ev-action-btn--edit" onClick={() => handleEditEvent(ev)} disabled={loading} title="Editar">
                            <i className="ti ti-pencil" aria-hidden="true" />
                          </button>
                          <button className="ev-action-btn ev-action-btn--del" onClick={() => setEventToDelete(ev)} disabled={loading} title="Eliminar">
                            <i className="ti ti-trash" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="ev-empty-box">
          <span className="ev-empty-box-icon">📭</span>
          <div className="ev-empty-box-title">
            {searchTerm||statusFilter||typeFilter ? 'No se encontraron eventos con los criterios especificados' : 'No hay eventos disponibles. ¡Crea el primero!'}
          </div>
          {!(searchTerm||statusFilter||typeFilter) && (
            <button onClick={handleCreateEvent} className="ev-empty-box-btn">
              <i className="ti ti-plus" aria-hidden="true" />Crear primer evento
            </button>
          )}
        </div>
      )}
 
      {/* MODAL FORM */}
      <EventFormModal open={isModalOpen} onClose={handleCloseModal} event={selectedEvent} restaurantId={selectedRestaurantId} />
 
      {/* CONFIRM DELETE */}
      {eventToDelete && (
        <div className="ev-confirm-overlay">
          <div className="ev-confirm-box">
            <div className="ev-confirm-icon"><i className="ti ti-trash" aria-hidden="true" /></div>
            <div className="ev-confirm-title">¿Eliminar evento?</div>
            <div className="ev-confirm-msg">¿Estás seguro de que deseas eliminar el evento <strong>"{eventToDelete.nombre}"</strong>? Esta acción no se puede deshacer.</div>
            <div className="ev-confirm-btns">
              <button onClick={() => setEventToDelete(null)} className="ev-btn-cancel-confirm">Cancelar</button>
              <button onClick={handleConfirmDelete} disabled={!!deletingId} className="ev-btn-del-confirm">
                {deletingId ? <><span style={{width:12,height:12,border:'2px solid rgba(200,80,80,.25)',borderTopColor:'var(--ev-red)',borderRadius:'50%',animation:'ev-spin .7s linear infinite',display:'inline-block'}} />Eliminando...</> : <><i className="ti ti-trash" aria-hidden="true" />Eliminar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};