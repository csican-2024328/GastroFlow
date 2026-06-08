import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useReservationStore } from '../store/useReservationStore.js';
import { ReservationForm } from '../components/ReservationForm.jsx';
import { ReservationHistory } from '../components/ReservationHistory.jsx';
import { ReservationConfirmation } from '../components/ReservationConfirmation.jsx';
import '../../../styles/reservations.css';
 
export const ReservationsPage = () => {
  const navigate = useNavigate();
  const user  = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
 
  const restaurants        = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants   = useRestaurantStore((s) => s.fetchRestaurants);
 
  const reservations             = useReservationStore((s) => s.reservations);
  const availableTables          = useReservationStore((s) => s.availableTables);
  const loading                  = useReservationStore((s) => s.loading);
  const error                    = useReservationStore((s) => s.error);
  const createReservationAction  = useReservationStore((s) => s.createReservationAction);
  const fetchUserReservations    = useReservationStore((s) => s.fetchUserReservations);
  const fetchAvailableTables     = useReservationStore((s) => s.fetchAvailableTables);
  const cancelReservationAction  = useReservationStore((s) => s.cancelReservationAction);
 
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmation,   setShowConfirmation]   = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);
  const [activeTab,          setActiveTab]          = useState('new');
 
  /* ── Effects — INTACTOS ── */
  useEffect(() => { fetchRestaurants(1, 50); }, [fetchRestaurants]);
  useEffect(() => { if (token) fetchUserReservations(1, 20); }, [token, fetchUserReservations]);
 
  /* ── Handlers — INTACTOS ── */
  const handleFormSubmit = async (reservationData) => {
    const result = await createReservationAction(reservationData);
    if (result.success) {
      setCreatedReservation(result.data);
      setShowConfirmation(true);
      if (result.data?.estado==='PENDIENTE') toast.success('⏳ Tu reservación está siendo observada. Recibirás un email pronto.');
      else toast.success('¡Reserva confirmada exitosamente!');
      await fetchUserReservations(1, 20);
    } else { toast.error(result.error||'Error al crear la reserva'); }
  };
 
  const handleCancelReservation = async (id) => {
    const result = await cancelReservationAction(id, 'Cancelada por el usuario');
    if (result.success) { toast.success('Reserva cancelada exitosamente'); await fetchUserReservations(1,20); }
    else toast.error(result.error||'Error al cancelar la reserva');
  };
 
  const handleConfirmationClose = () => {
    setShowConfirmation(false); setSelectedRestaurant(null); setActiveTab('history');
  };
 
  /* ── VISTA: Seleccionar restaurante ── */
  if (!selectedRestaurant) {
    return (
      <div className="rvp-root">
        <header className="rvp-header">
          <div className="rvp-header-inner">
            <div>
              <h1 className="rvp-header-title">Reservaciones</h1>
              <p className="rvp-header-sub">{user?.name}, elige un restaurante para reservar</p>
            </div>
            <div className="rvp-header-actions">
              <button onClick={() => navigate('/cliente')} className="rvp-btn-back">
                <i className="ti ti-arrow-left" aria-hidden="true" />Menú Principal
              </button>
            </div>
          </div>
        </header>
        <main className="rvp-main">
          <h2 className="rvp-section-title">Selecciona un restaurante</h2>
          {restaurants.length === 0 ? (
            <div style={{ background:'var(--rv-bg-panel)', border:'.5px solid var(--rv-border)', borderRadius:14, padding:'48px 24px', textAlign:'center' }}>
              <p style={{ fontSize:13, color:'var(--rv-text-tertiary)' }}>No hay restaurantes disponibles</p>
            </div>
          ) : (
            <div className="rvp-restaurant-grid">
              {restaurants.map((restaurant, idx) => (
                <button key={restaurant._id} onClick={() => setSelectedRestaurant(restaurant)} className="rvp-restaurant-card" style={{ animationDelay:`${idx*.05}s` }}>
                  <div className="rvp-restaurant-img">
                    {restaurant.fotos?.length > 0 ? (
                      <img src={restaurant.fotos[0]} alt={restaurant.name} />
                    ) : (
                      <div className="rvp-restaurant-no-img">🍽️</div>
                    )}
                  </div>
                  <div className="rvp-restaurant-body">
                    <div className="rvp-restaurant-name">{restaurant.name}</div>
                    {restaurant.category && <div className="rvp-restaurant-cat">{restaurant.category}</div>}
                    {(restaurant.direccion||restaurant.address) && (
                      <div className="rvp-restaurant-addr">
                        <i className="ti ti-map-pin" aria-hidden="true" />
                        {restaurant.direccion||restaurant.address}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }
 
  /* ── VISTA: Formulario / Historial ── */
  return (
    <div className="rvp-root">
      <header className="rvp-header">
        <div className="rvp-header-inner">
          <div>
            <h1 className="rvp-header-title">{selectedRestaurant?.name||'Reservaciones'}</h1>
            <p className="rvp-header-sub">Sistema de reservas</p>
          </div>
          <div className="rvp-header-actions">
            <button onClick={() => setSelectedRestaurant(null)} className="rvp-btn-back rvp-btn-back--gold">
              <i className="ti ti-arrow-left" aria-hidden="true" />Cambiar Restaurante
            </button>
            <button onClick={() => navigate('/cliente')} className="rvp-btn-back">
              <i className="ti ti-arrow-left" aria-hidden="true" />Menú Principal
            </button>
          </div>
        </div>
      </header>
 
      <main className="rvp-main">
        {/* Tabs */}
        <div className="rvp-tabs">
          <button onClick={() => setActiveTab('new')} className={`rvp-tab${activeTab==='new'?' active':''}`}>
            📅 Nueva Reserva
          </button>
          <button onClick={() => setActiveTab('history')} className={`rvp-tab${activeTab==='history'?' active':''}`}>
            📋 Mis Reservaciones ({reservations.length})
          </button>
        </div>
 
        {activeTab==='new' && (
          <div>
            {error && (
              <div className="rvp-error-box">
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}
            <ReservationForm
              restaurant={selectedRestaurant}
              onSubmit={handleFormSubmit}
              onCheckAvailability={fetchAvailableTables}
              isLoading={loading}
              availableTables={availableTables}
            />
          </div>
        )}
 
        {activeTab==='history' && (
          <ReservationHistory
            reservations={reservations}
            onCancel={handleCancelReservation}
            isLoading={loading}
          />
        )}
      </main>
 
      {showConfirmation && createdReservation && (
        <ReservationConfirmation
          reservation={createdReservation}
          restaurant={selectedRestaurant}
          onClose={handleConfirmationClose}
        />
      )}
    </div>
  );
};