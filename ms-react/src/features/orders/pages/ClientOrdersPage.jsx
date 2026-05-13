import { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { useOrderStore } from '../store/useOrderStore.js';
import { OrderFlowModal } from '../components/OrderFlowModal.jsx';
import { notyfSuccess } from '../../../shared/utils/notyf.js';

export const ClientOrdersPage = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const restaurants = useRestaurantStore((s) => s.restaurants);
  const restaurantsLoading = useRestaurantStore((s) => s.loading);
  const fetchRestaurants = useRestaurantStore((s) => s.fetchRestaurants);

  const orders = useOrderStore((s) => s.orders);
  const ordersLoading = useOrderStore((s) => s.loading);
  const fetchClientOrders = useOrderStore((s) => s.fetchClientOrders);

  useEffect(() => {
    fetchRestaurants(1, 50);
    if (token) {
      fetchClientOrders(1, 10);
    }
  }, [fetchRestaurants, fetchClientOrders, token]);

  const handleOpenModal = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurantId(null);
    if (token) {
      fetchClientOrders(1, 10);
    }
  };

  const getOrderStatus = (status) => {
    const statusMap = {
      'pendiente': { icon: '⏳', label: 'Pendiente', color: 'bg-yellow-50 text-yellow-700' },
      'confirmada': { icon: '✓', label: 'Confirmada', color: 'bg-blue-50 text-blue-700' },
      'preparando': { icon: '👨‍🍳', label: 'Preparando', color: 'bg-orange-50 text-orange-700' },
      'lista': { icon: '📦', label: 'Lista', color: 'bg-green-50 text-green-700' },
      'entregada': { icon: '✓✓', label: 'Entregada', color: 'bg-green-100 text-green-800' },
      'cancelada': { icon: '✕', label: 'Cancelada', color: 'bg-red-50 text-red-700' },
    };
    return statusMap[status] || { icon: '?', label: status, color: 'bg-gray-50 text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#EEE8DC]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#D4984E] to-[#B8860B] shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">🍽️ Mi Pedidos</h1>
          <p className="text-[#FFF8F0]">Bienvenido, {user?.name}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Section: Make a New Order */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">📝 Hacer un Pedido</h2>

          {restaurantsLoading ? (
            <div className="text-center py-12">
              <p className="text-[#4b4b4b]">Cargando restaurantes...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="bg-[#FFF8F0] border-2 border-[#E2D4B7] rounded-lg p-8 text-center">
              <p className="text-[#4b4b4b] font-semibold">No hay restaurantes disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="bg-white border border-[#E2D4B7] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Restaurant Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[#E2D4B7] to-[#D4C4A3] overflow-hidden">
                    {restaurant.fotos && restaurant.fotos.length > 0 ? (
                      <img
                        src={restaurant.fotos[0]}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{restaurant.name}</h3>
                    <p className="text-sm text-[#4b4b4b] mb-4">{restaurant.description}</p>

                    {/* Details */}
                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex items-center text-[#4b4b4b]">
                        <span className="mr-2">📍</span>
                        <span>{restaurant.address}</span>
                      </div>
                      <div className="flex items-center text-[#4b4b4b]">
                        <span className="mr-2">📞</span>
                        <span>{restaurant.phone}</span>
                      </div>
                      {restaurant.averagePrice && (
                        <div className="flex items-center text-[#4b4b4b]">
                          <span className="mr-2">💰</span>
                          <span>${restaurant.averagePrice}</span>
                        </div>
                      )}
                    </div>

                    {/* Order Button */}
                    <button
                      onClick={() => handleOpenModal(restaurant._id)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-[#D4984E] to-[#B8860B] text-white rounded-lg hover:from-[#C2852D] hover:to-[#A67C09] transition-all font-bold shadow-md hover:shadow-lg"
                    >
                      🛒 Hacer Pedido
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Recent Orders */}
        <section>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">📦 Mis Pedidos Recientes</h2>

          {ordersLoading ? (
            <div className="text-center py-12">
              <p className="text-[#4b4b4b]">Cargando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#FFF8F0] border-2 border-[#E2D4B7] rounded-lg p-8 text-center">
              <p className="text-[#4b4b4b] font-semibold mb-2">Aún no tienes pedidos</p>
              <p className="text-sm text-[#4b4b4b]">¡Haz tu primer pedido hoy!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = getOrderStatus(order.estado);
                return (
                  <div
                    key={order._id}
                    className="bg-white border border-[#E2D4B7] rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      {/* Order Number */}
                      <div>
                        <p className="text-xs text-[#4b4b4b] mb-1">Número de Pedido</p>
                        <p className="font-bold text-[#1A1A1A]">{order.numeroOrden}</p>
                      </div>

                      {/* Items Count */}
                      <div>
                        <p className="text-xs text-[#4b4b4b] mb-1">Artículos</p>
                        <p className="font-bold text-[#1A1A1A]">{order.items?.length || 0} items</p>
                      </div>

                      {/* Total */}
                      <div>
                        <p className="text-xs text-[#4b4b4b] mb-1">Total</p>
                        <p className="font-bold text-[#D4984E]">${order.total?.toFixed(2) || '0.00'}</p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs text-[#4b4b4b] mb-1">Estado</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>

                      {/* View Details Button */}
                      <div className="text-right">
                        <button className="px-4 py-2 bg-[#E2D4B7] text-[#1A1A1A] rounded-lg hover:bg-[#d8c8a6] transition-colors font-semibold text-sm">
                          Ver Detalles
                        </button>
                      </div>
                    </div>

                    {/* Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#E2D4B7]">
                        <p className="text-xs text-[#4b4b4b] mb-2">Artículos:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-xs bg-[#FFF8F0] text-[#4b4b4b] px-2 py-1 rounded">
                              {item.cantidad}x {item.nombre}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-xs bg-[#FFF8F0] text-[#4b4b4b] px-2 py-1 rounded">
                              +{order.items.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Order Flow Modal */}
      <OrderFlowModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        restaurantId={selectedRestaurantId}
      />
    </div>
  );
};
