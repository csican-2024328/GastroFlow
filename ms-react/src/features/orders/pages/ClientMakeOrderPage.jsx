import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { ReviewRatingWidget } from '../../reviews/index.js';
import { OrderFlowModal } from '../components/OrderFlowModal.jsx';

export const ClientMakeOrderPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const restaurants = useRestaurantStore((s) => s.restaurants);
  const restaurantsLoading = useRestaurantStore((s) => s.loading);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);

  useEffect(() => {
    fetchRestaurants(1, 50);
  }, [fetchRestaurants]);

  const handleOpenModal = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurantId(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#f5ede0] fade-in">
      <header className="border-b border-[#2f2218] bg-[#111009]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#f5ede0]">Hacer Pedido</h1>
            <p className="text-sm text-[#b8a48a]">{user?.name}, elige tu restaurante favorito</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2f2218] bg-[#0e0d0a] px-4 py-2 text-sm font-semibold text-[#f5ede0] hover:bg-[#1a1a14]"
            >
              ← Menu Principal
            </button>
            <button
              onClick={() => navigate('/cliente/pedidos/mis')}
              className="rounded-full border border-[#c88c28] bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-4 py-2 text-sm font-semibold text-[#0a0a08] hover:opacity-90"
            >
              Ver Mis Pedidos
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {restaurantsLoading ? (
          <div className="py-14 text-center text-[#b8a48a]">Cargando restaurantes...</div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-2xl border border-[#2f2218] bg-[#111009] p-10 text-center shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
            <p className="font-semibold text-[#f5ede0]">No hay restaurantes disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="overflow-hidden rounded-2xl border border-[#2f2218] bg-[#111009] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.38)]"
              >
                <div className="h-44 bg-gradient-to-br from-[#E2D4B7] to-[#F8F5F0]">
                  {restaurant.fotos && restaurant.fotos.length > 0 ? (
                    <img
                      src={restaurant.fotos[0]}
                      alt={restaurant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
                  )}
                </div>

                <div className="space-y-3 p-5">
                  <h3 className="text-xl font-bold text-[#f5ede0]">{restaurant.name}</h3>
                  <p className="line-clamp-2 text-sm text-[#b8a48a]">{restaurant.description || 'Cocina especial para todos los gustos.'}</p>

                  <div className="py-2 border-t border-b border-[#2f2218]">
                    <ReviewRatingWidget restaurantID={restaurant._id} showCount={true} />
                  </div>

                  <div className="space-y-1 text-sm text-[#b8a48a]">
                    <p>📍 {restaurant.address}</p>
                    <p>📞 {restaurant.phone}</p>
                    {restaurant.averagePrice && <p>💰 ${restaurant.averagePrice}</p>}
                  </div>

                  <button
                    onClick={() => handleOpenModal(restaurant._id)}
                    className="w-full rounded-xl bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-4 py-3 font-bold text-[#0a0a08] shadow-sm hover:opacity-90"
                  >
                    🛒 Hacer Pedido
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <OrderFlowModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        restaurantId={selectedRestaurantId}
      />
    </div>
  );
};
