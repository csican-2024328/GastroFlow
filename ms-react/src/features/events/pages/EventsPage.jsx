import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useEventStore } from '../store/useEventStore.js';
import { EventCard } from '../components/EventCard.jsx';

export const EventsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const restaurants = useRestaurantStore((s) => s.restaurants);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);

  const events = useEventStore((s) => s.events);
  const loading = useEventStore((s) => s.loading);
  const error = useEventStore((s) => s.error);
  const fetchVicentesEvents = useEventStore((s) => s.fetchVicentesEvents);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants(1, 50);
  }, [fetchRestaurants]);

  // Load events when restaurant is selected
  useEffect(() => {
    if (selectedRestaurantId) {
      setEventsLoading(true);
      fetchVicentesEvents(selectedRestaurantId).finally(() => {
        setEventsLoading(false);
      });
    }
  }, [selectedRestaurantId, fetchVicentesEvents]);

  const handleEventUsed = (eventId) => {
    // Event state is updated in the store, component will re-render
  };

  // If no restaurant selected, show restaurant selector
  if (!selectedRestaurantId) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-gray-800 fade-in">
        <header className="border-b border-[#E8D4B8] bg-[#F5EFEA]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <div>
              <h1 className="font-['Playfair_Display'] text-3xl font-bold text-gray-800">
                Ofertas y Eventos
              </h1>
              <p className="text-sm text-[#5A5146]">{user?.name}, selecciona un restaurante para ver los eventos vigentes</p>
            </div>
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2D4F4F] bg-white px-4 py-2 text-sm font-semibold text-[#2D4F4F] hover:bg-gray-200"
            >
              ← Menu Principal
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 py-8">
          <div className="mb-6">
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-gray-800">
              Selecciona un restaurante
            </h2>
          </div>

          {restaurants.length === 0 ? (
            <div className="rounded-2xl border border-[#E8D4B8] bg-[#FDFBF7] p-10 text-center">
              <p className="text-gray-600">No hay restaurantes disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant._id}
                  onClick={() => setSelectedRestaurantId(restaurant._id)}
                  className="overflow-hidden rounded-2xl border border-[#E8D4B8] bg-[#FDFBF7] text-left transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-32 bg-gradient-to-br from-[#F5EFEA] to-[#FDFBF7]">
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
                    <h3 className="font-['Playfair_Display'] text-lg font-bold text-gray-800">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600">{restaurant.category || 'Restaurante'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Show events for selected restaurant
  const selectedRestaurant = restaurants.find((r) => r._id === selectedRestaurantId);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-800 fade-in">
      <header className="border-b border-gray-200 bg-[#FAF9F6]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-gray-800">
              {selectedRestaurant?.name || 'Eventos'}
            </h1>
            <p className="text-sm text-[#5A5146]">Ofertas y eventos vigentes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="rounded-full border border-[#E8956B] bg-white px-4 py-2 text-sm font-semibold text-[#E8956B] hover:bg-gray-200"
            >
              ← Cambiar Restaurante
            </button>
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2D4F4F] bg-white px-4 py-2 text-sm font-semibold text-[#2D4F4F] hover:bg-gray-200"
            >
              ← Menu Principal
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {eventsLoading || loading ? (
          <div className="py-14 text-center text-[#5A5146]">Cargando eventos...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">{error}</p>
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="mt-4 rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Volver a seleccionar restaurante
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <div className="mb-4 text-5xl">📭</div>
            <p className="font-semibold text-gray-800">No hay eventos vigentes</p>
            <p className="mt-2 text-sm text-gray-600">
              Vuelve pronto para descubrir nuestras próximas ofertas y eventos especiales
            </p>
            <button
              onClick={() => setSelectedRestaurantId(null)}
              className="mt-6 rounded-lg border border-[#2D4F4F] bg-[#FDFBF7] px-6 py-2 font-semibold text-[#2D4F4F] hover:bg-[#F5EFEA]"
            >
              Seleccionar otro restaurante
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEventUsed={handleEventUsed}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
