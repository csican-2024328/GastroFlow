import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useOrderStore } from '../store/useOrderStore.js';
import { ReviewForm } from '../../reviews/index.js';

export const ClientMyOrdersPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [showReviewForOrder, setShowReviewForOrder] = useState({});

  const orders = useOrderStore((s) => s.orders);
  const ordersLoading = useOrderStore((s) => s.loading);
  const fetchClientOrders = useOrderStore((s) => s.fetchClientOrders);

  useEffect(() => {
    if (token) {
      fetchClientOrders(1, 20);
    }
  }, [token, fetchClientOrders]);

  const getOrderStatus = (status) => {
    const statusMap = {
      EN_PREPARACION: { icon: '⏳', label: 'En preparacion', color: 'bg-[#F8F1DF] text-[#7B5D27]' },
      LISTO: { icon: '✅', label: 'Listo', color: 'bg-[#E4EFE8] text-[#2C4035]' },
      ENTREGADO: { icon: '📦', label: 'Entregado', color: 'bg-[#E2D4B7] text-[#3D2C1E]' },
      CANCELADO: { icon: '✖', label: 'Cancelado', color: 'bg-[#F8E7E2] text-[#D97065]' },
    };
    return statusMap[status] || { icon: '•', label: status, color: 'bg-[#EFE8DC] text-[#5A5146]' };
  };

  // Debugging: ver estructura del order
  useEffect(() => {
    if (orders.length > 0) {
      console.log('📦 Primer order:', orders[0]);
      console.log('🔍 restaurantID del primer order:', orders[0].restaurantID);
      console.log('📊 Tipo de restaurantID:', typeof orders[0].restaurantID);
    }
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#0b0a08] text-[#f5ede0] fade-in">
      <header className="border-b border-[#2f2218] bg-[#111009]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#f5ede0]">Mis Pedidos</h1>
            <p className="text-sm text-[#b8a48a]">{user?.name}, sigue el estado de tus pedidos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2f2218] bg-[#0e0d0a] px-4 py-2 text-sm font-semibold text-[#f5ede0] hover:bg-[#1a1a14]"
            >
              ← Menu Principal
            </button>
            <button
              onClick={() => navigate('/cliente/pedidos/hacer')}
              className="rounded-full border border-[#c88c28] bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-4 py-2 text-sm font-semibold text-[#0a0a08] hover:opacity-90"
            >
              Hacer un Pedido
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {ordersLoading ? (
          <div className="py-14 text-center text-[#b8a48a]">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#2f2218] bg-[#111009] p-10 text-center shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
            <p className="font-semibold text-[#f5ede0]">Aun no tienes pedidos</p>
            <button
              onClick={() => navigate('/cliente/pedidos/hacer')}
              className="mt-4 rounded-xl bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-4 py-2 font-bold text-[#0a0a08]"
            >
              Crear mi primer pedido
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getOrderStatus(order.estado);
              const restaurantIdToUse = order.restaurantID?._id
                ? String(order.restaurantID._id)
                : order.restaurantID
                  ? String(order.restaurantID)
                  : '';

              return (
                <article
                  key={order._id}
                  className="rounded-2xl border border-[#2f2218] bg-[#111009] p-6 shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center">
                    <div>
                      <p className="text-xs text-[#b8a48a]">Numero de Pedido</p>
                      <p className="font-bold text-[#f5ede0]">{order.numeroOrden}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#b8a48a]">Articulos</p>
                      <p className="font-bold text-[#f5ede0]">{order.items?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#b8a48a]">Total</p>
                      <p className="font-bold text-[#c88c28]">${order.total?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#b8a48a]">Estado</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    <div className="md:text-right">
                      <button
                        onClick={() => navigate(`/cliente/pedidos/${order._id}`)}
                        className="rounded-xl bg-[#0e0d0a] px-4 py-2 text-sm font-semibold text-[#f5ede0] border border-[#2f2218] hover:bg-[#1a1a14]"
                      >
                        Ver seguimiento
                      </button>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 border-t border-[#2f2218] pt-4">
                      <p className="mb-2 text-xs text-[#b8a48a]">Articulos:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-[#0e0d0a] px-2 py-1 text-xs text-[#b8a48a] border border-[#2f2218]"
                          >
                            {item.cantidad}x {item.nombre}
                          </span>
                        ))}
                      </div>

                      {/* Mostrar formulario de reseña solo si el pedido está entregado */}
                      {order.estado === 'ENTREGADO' && (
                        <div className="mt-4 border-t border-[#2f2218] pt-4">
                          <button
                            onClick={() =>
                              setShowReviewForOrder((prev) => ({
                                ...prev,
                                [order._id]: !prev[order._id],
                              }))
                            }
                            className="mb-3 rounded-lg bg-gradient-to-r from-[#c88c28] to-[#9a6a18] px-4 py-2 text-sm font-semibold text-[#0a0a08] hover:opacity-90 transition-colors"
                          >
                            {showReviewForOrder[order._id] ? '✖ Cancelar Reseña' : '⭐ Dejar una Reseña'}
                          </button>

                          {showReviewForOrder[order._id] && (
                            <div className="mt-3 rounded-lg border border-[#2f2218] bg-[#111009] p-4">
                              {!restaurantIdToUse && (
                                <p className="mb-3 text-sm text-[#e06d6d] font-semibold">
                                  ⚠️ Error: Restaurante no disponible. Por favor recarga la página.
                                </p>
                              )}
                              <ReviewForm
                                restaurantID={restaurantIdToUse}
                                onReviewCreated={() => {
                                  setShowReviewForOrder((prev) => ({
                                    ...prev,
                                    [order._id]: false,
                                  }));
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
