import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useReservationStore } from '../store/useReservationStore.js';
import { ReservationForm } from '../components/ReservationForm.jsx';
import { ReservationHistory } from '../components/ReservationHistory.jsx';
import { ReservationConfirmation } from '../components/ReservationConfirmation.jsx';

export const ReservationsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const restaurants = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);

  const reservations = useReservationStore((s) => s.reservations);
  const availableTables = useReservationStore((s) => s.availableTables);
  const loading = useReservationStore((s) => s.loading);
  const error = useReservationStore((s) => s.error);
  const createReservationAction = useReservationStore((s) => s.createReservationAction);
  const fetchUserReservations = useReservationStore((s) => s.fetchUserReservations);
  const fetchAvailableTables = useReservationStore((s) => s.fetchAvailableTables);
  const cancelReservationAction = useReservationStore((s) => s.cancelReservationAction);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);
  const [activeTab, setActiveTab] = useState('new'); // 'new' o 'history'

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants(1, 50);
  }, [fetchRestaurants]);

  // Fetch user reservations on mount
  useEffect(() => {
    if (token) {
      fetchUserReservations(1, 20);
    }
  }, [token, fetchUserReservations]);

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleFormSubmit = async (reservationData) => {
    const reservationResult = await createReservationAction(reservationData);

    if (reservationResult.success) {
      setCreatedReservation(reservationResult.data);
      setShowConfirmation(true);
      toast.success('¡Reserva confirmada exitosamente!');

      // Refresh reservations list
      await fetchUserReservations(1, 20);
    } else {
      toast.error(reservationResult.error || 'Error al crear la reserva');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    const result = await cancelReservationAction(reservationId, 'Cancelada por el usuario');

    if (result.success) {
      toast.success('Reserva cancelada exitosamente');
      await fetchUserReservations(1, 20);
    } else {
      toast.error(result.error || 'Error al cancelar la reserva');
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSelectedRestaurant(null);
    setActiveTab('history');
  };

  // Vista: Seleccionar restaurante
  if (!selectedRestaurant) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] fade-in">
        <header className="border-b border-[#E2D4B7] bg-[#F8F5F0]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div>
              <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">
                Reservaciones
              </h1>
              <p className="text-sm text-[#5A5146]">{user?.name}, elige un restaurante</p>
            </div>
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              ← Menu Principal
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-8">
          <div className="mb-6">
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">
              Selecciona un restaurante
            </h2>
          </div>

          {restaurants.length === 0 ? (
            <div className="rounded-2xl border border-[#E2D4B7] bg-white p-10 text-center">
              <p className="text-[#5A5146]">No hay restaurantes disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant._id}
                  onClick={() => handleRestaurantSelect(restaurant)}
                  className="overflow-hidden rounded-2xl border border-[#E2D4B7] bg-white text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-32 bg-gradient-to-br from-[#E2D4B7] to-[#F8F5F0]">
                    {restaurant.fotos && restaurant.fotos.length > 0 ? (
                      <img
                        src={restaurant.fotos[0]}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🍽️</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#1A1A1A]">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-[#5A5146]">{restaurant.category || 'Restaurante'}</p>
                    {restaurant.direccion && (
                      <p className="mt-2 text-xs text-[#B59070]">📍 {restaurant.direccion}</p>
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

  // Vista: Formulario de reserva o historial
  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] fade-in">
      <header className="border-b border-[#E2D4B7] bg-[#F8F5F0]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">
              {selectedRestaurant?.name || 'Reservaciones'}
            </h1>
            <p className="text-sm text-[#5A5146]">Sistema de reservas</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="rounded-full border border-[#C87A55] bg-white px-4 py-2 text-sm font-semibold text-[#C87A55] hover:bg-[#E2D4B7]"
            >
              ← Cambiar Restaurante
            </button>
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              ← Menu Principal
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-[#E2D4B7]">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'new'
                ? 'border-[#C49A2B] text-[#C49A2B]'
                : 'border-transparent text-[#5A5146] hover:text-[#1A1A1A]'
            }`}
          >
            📅 Nueva Reserva
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'history'
                ? 'border-[#C49A2B] text-[#C49A2B]'
                : 'border-transparent text-[#5A5146] hover:text-[#1A1A1A]'
            }`}
          >
            📋 Mis Reservaciones ({reservations.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'new' && (
          <div className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                <p>
                  <strong>⚠️ Error:</strong> {error}
                </p>
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

        {activeTab === 'history' && (
          <ReservationHistory
            reservations={reservations}
            onCancel={handleCancelReservation}
            isLoading={loading}
          />
        )}
      </main>

      {/* Confirmation Modal */}
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
