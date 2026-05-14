import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useOrderStore } from '../store/useOrderStore.js';

export const ClientMyOrdersPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

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

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] fade-in">
      <header className="border-b border-[#E2D4B7] bg-[#F8F5F0]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">Mis Pedidos</h1>
            <p className="text-sm text-[#5A5146]">{user?.name}, sigue el estado de tus pedidos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cliente')}
              className="rounded-full border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              ← Menu Principal
            </button>
            <button
              onClick={() => navigate('/cliente/pedidos/hacer')}
              className="rounded-full border border-[#C49A2B] bg-white px-4 py-2 text-sm font-semibold text-[#3D2C1E] hover:bg-[#E2D4B7]"
            >
              Hacer un Pedido
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {ordersLoading ? (
          <div className="py-14 text-center text-[#5A5146]">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#E2D4B7] bg-white p-10 text-center">
            <p className="font-semibold text-[#3D2C1E]">Aun no tienes pedidos</p>
            <button
              onClick={() => navigate('/cliente/pedidos/hacer')}
              className="mt-4 rounded-xl bg-gradient-to-r from-[#C49A2B] to-[#E8B84B] px-4 py-2 font-bold text-white"
            >
              Crear mi primer pedido
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getOrderStatus(order.estado);
              return (
                <article
                  key={order._id}
                  className="rounded-2xl border border-[#E2D4B7] bg-white p-6 shadow-[0_8px_20px_rgba(61,44,30,0.08)]"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center">
                    <div>
                      <p className="text-xs text-[#5A5146]">Numero de Pedido</p>
                      <p className="font-bold text-[#1A1A1A]">{order.numeroOrden}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A5146]">Articulos</p>
                      <p className="font-bold text-[#1A1A1A]">{order.items?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A5146]">Total</p>
                      <p className="font-bold text-[#C49A2B]">${order.total?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A5146]">Estado</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    <div className="md:text-right">
                      <button className="rounded-xl bg-[#E2D4B7] px-4 py-2 text-sm font-semibold text-[#3D2C1E] hover:bg-[#D7C7A5]">
                        Ver Detalles
                      </button>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 border-t border-[#E2D4B7] pt-4">
                      <p className="mb-2 text-xs text-[#5A5146]">Articulos:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-[#F8F5F0] px-2 py-1 text-xs text-[#5A5146]"
                          >
                            {item.cantidad}x {item.nombre}
                          </span>
                        ))}
                      </div>
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
