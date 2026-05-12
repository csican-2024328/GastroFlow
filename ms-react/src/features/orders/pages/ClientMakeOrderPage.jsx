import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
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
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] fade-in">
      <header className="border-b border-[#E2D4B7] bg-[#F8F5F0]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">Hacer Pedido</h1>
            <p className="text-sm text-[#5A5146]">{user?.name}, elige tu restaurante favorito</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              ← Menu Principal
            </button>
            <button
              onClick={() => navigate('/cliente/pedidos/mis')}
              className="rounded-full border border-[#C49A2B] bg-white px-4 py-2 text-sm font-semibold text-[#3D2C1E] hover:bg-[#E2D4B7]"
            >
              Ver Mis Pedidos
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {restaurantsLoading ? (
          <div className="py-14 text-center text-[#5A5146]">Cargando restaurantes...</div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-2xl border border-[#E2D4B7] bg-white p-10 text-center">
            <p className="font-semibold text-[#3D2C1E]">No hay restaurantes disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="overflow-hidden rounded-2xl border border-[#E2D4B7] bg-white shadow-[0_10px_24px_rgba(61,44,30,0.10)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(61,44,30,0.14)]"
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
                  <h3 className="text-xl font-bold text-[#1A1A1A]">{restaurant.name}</h3>
                  <p className="line-clamp-2 text-sm text-[#5A5146]">{restaurant.description || 'Cocina especial para todos los gustos.'}</p>

                  <div className="space-y-1 text-sm text-[#5A5146]">
                    <p>📍 {restaurant.address}</p>
                    <p>📞 {restaurant.phone}</p>
                    {restaurant.averagePrice && <p>💰 ${restaurant.averagePrice}</p>}
                  </div>

                  <button
                    onClick={() => handleOpenModal(restaurant._id)}
                    className="w-full rounded-xl bg-gradient-to-r from-[#C49A2B] to-[#E8B84B] px-4 py-3 font-bold text-white shadow-sm hover:from-[#B08922] hover:to-[#D9A83C]"
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
