import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useEventStore } from '../store/useEventStore.js';
import { EventCard } from '../components/EventCard.jsx';
import '../../../styles/events.css';
 
export const EventsPage = () => {
  const navigate         = useNavigate();
  const user             = useAuthStore((s) => s.user);
  const restaurants      = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);
  const events             = useEventStore((s) => s.events);
  const loading            = useEventStore((s) => s.loading);
  const error              = useEventStore((s) => s.error);
  const fetchVicentesEvents = useEventStore((s) => s.fetchVicentesEvents);
 
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [eventsLoading,        setEventsLoading]        = useState(false);
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => { fetchRestaurants(1,50); }, [fetchRestaurants]);
  useEffect(() => {
    if (selectedRestaurantId) {
      setEventsLoading(true);
      fetchVicentesEvents(selectedRestaurantId).finally(() => setEventsLoading(false));
    }
  }, [selectedRestaurantId, fetchVicentesEvents]);
 
  const handleEventUsed = (eventId) => {};
 
  /* ── VISTA: Seleccionar restaurante ── */
  if (!selectedRestaurantId) {
    return (
      <div className="ev-client-root">
        <header className="ev-client-header">
          <div className="ev-client-header-inner">
            <div>
              <h1 className="ev-client-header-title">Ofertas y Eventos</h1>
              <p className="ev-client-header-sub">{user?.name}, selecciona un restaurante para ver los eventos vigentes</p>
            </div>
            <button onClick={() => navigate('/cliente')} className="ev-btn-back">
              <i className="ti ti-arrow-left" aria-hidden="true" />Menú Principal
            </button>
          </div>
        </header>
        <main className="ev-client-main">
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:'var(--ev-text-primary)',marginBottom:16}}>Selecciona un restaurante</h2>
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
        </main>
      </div>
    );
  }
 
  /* ── VISTA: Eventos del restaurante ── */
  const selectedRestaurant = restaurants.find(r => r._id===selectedRestaurantId);
 
  return (
    <div className="ev-client-root">
      <header className="ev-client-header">
        <div className="ev-client-header-inner">
          <div>
            <h1 className="ev-client-header-title">{selectedRestaurant?.name||'Eventos'}</h1>
            <p className="ev-client-header-sub">Ofertas y eventos vigentes</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => setSelectedRestaurantId(null)} className="ev-btn-back ev-btn-back--gold">
              <i className="ti ti-arrow-left" aria-hidden="true" />Cambiar Restaurante
            </button>
            <button onClick={() => navigate('/cliente')} className="ev-btn-back">
              <i className="ti ti-arrow-left" aria-hidden="true" />Menú Principal
            </button>
          </div>
        </div>
      </header>
 
      <main className="ev-client-main">
        {eventsLoading || loading ? (
          <div className="ev-client-loading"><div className="ev-spinner" />Cargando eventos...</div>
        ) : error ? (
          <div className="ev-client-error-box">
            <div className="ev-client-error-msg">{error}</div>
            <button onClick={() => setSelectedRestaurantId(null)} className="ev-empty-box-btn">
              <i className="ti ti-arrow-left" aria-hidden="true" />Volver a seleccionar restaurante
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="ev-empty-box">
            <span className="ev-empty-box-icon">📭</span>
            <div className="ev-empty-box-title">No hay eventos vigentes</div>
            <p style={{fontSize:12,color:'var(--ev-text-tertiary)',marginBottom:16,lineHeight:1.5}}>Vuelve pronto para descubrir nuestras próximas ofertas y eventos especiales</p>
            <button onClick={() => setSelectedRestaurantId(null)} className="ev-empty-box-btn">
              <i className="ti ti-arrow-left" aria-hidden="true" />Seleccionar otro restaurante
            </button>
          </div>
        ) : (
          <div className="ev-client-grid">
            {events.map((ev, idx) => (
              <EventCard key={ev._id} event={ev} onEventUsed={handleEventUsed} delay={idx*.05} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
 