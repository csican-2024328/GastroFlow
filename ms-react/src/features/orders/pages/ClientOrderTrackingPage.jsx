import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useOrderStore } from '../store/useOrderStore.js';

const PAYMENT_METHODS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
];

const TRACKING_STEPS = [
  { key: 'PENDIENTE', label: 'Pendiente' },
  { key: 'EN_PREPARACION', label: 'En preparación' },
  { key: 'LISTO', label: 'Listo' },
  { key: 'ENTREGADO', label: 'Entregado' },
];

const STATUS_LABELS = {
  EN_PREPARACION: { label: 'En preparación', badge: 'bg-[#F8F1DF] text-[#7B5D27]' },
  LISTO: { label: 'Listo para pagar', badge: 'bg-[#E4EFE8] text-[#2C4035]' },
  ENTREGADO: { label: 'Entregado', badge: 'bg-[#E2D4B7] text-[#3D2C1E]' },
  CANCELADO: { label: 'Cancelado', badge: 'bg-[#F8E7E2] text-[#C87A55]' },
};

const formatCurrency = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3006/api/v1';
  return import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/v1\/?$/, '');
};

const PaymentModal = ({ order, onClose, onConfirm, isSaving }) => {
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [propina, setPropina] = useState('0');
  const [cargosExtra, setCargosExtra] = useState('0');

  const subtotal = Number(order?.subtotal || 0);
  const impuesto = Number(order?.impuesto || 0);
  const descuento = Number(order?.descuento || 0);
  const total = Number(order?.total || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onConfirm({
      metodoPago,
      propina: Math.max(0, Number(propina) || 0),
      cargosExtra: Math.max(0, Number(cargosExtra) || 0),
    });
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E2D4B7] bg-white shadow-2xl">
        <div className="border-b border-[#E2D4B7] px-6 py-4">
          <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">Pago del pedido</h3>
          <p className="text-sm text-[#5A5146]">Revisa el resumen y confirma cuando estés listo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="rounded-2xl border border-[#E8D9C4] bg-[#FAF7F2] p-4">
            <h4 className="mb-3 font-semibold text-[#1A1A1A]">Resumen del pedido</h4>
            <div className="space-y-2 text-sm text-[#5A5146]">
              {order.items?.map((item) => (
                <div key={`${item.tipo}-${item.plato || item.menu}`} className="flex justify-between gap-3 border-b border-[#E8D9C4] pb-2 last:border-0 last:pb-0">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatCurrency(item.subtotal ?? item.precioUnitario * item.cantidad)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between"><span>Subtotal</span><span className="font-semibold text-[#1A1A1A]">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Impuesto</span><span className="font-semibold text-[#1A1A1A]">{formatCurrency(impuesto)}</span></div>
              <div className="flex justify-between"><span>Descuento</span><span className="font-semibold text-[#1A1A1A]">-{formatCurrency(descuento)}</span></div>
              <div className="flex justify-between border-t border-[#E8D9C4] pt-2 text-base font-bold text-[#1A1A1A]"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm font-semibold text-[#1A1A1A]">
              <span>Método de pago</span>
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full rounded-xl border border-[#E2D4B7] bg-white px-3 py-2 outline-none focus:border-[#C49A2B]">
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-semibold text-[#1A1A1A]">
              <span>Propina</span>
              <input type="number" min="0" step="0.01" value={propina} onChange={(e) => setPropina(e.target.value)} className="w-full rounded-xl border border-[#E2D4B7] bg-white px-3 py-2 outline-none focus:border-[#C49A2B]" />
            </label>

            <label className="space-y-2 text-sm font-semibold text-[#1A1A1A]">
              <span>Cargos extra</span>
              <input type="number" min="0" step="0.01" value={cargosExtra} onChange={(e) => setCargosExtra(e.target.value)} className="w-full rounded-xl border border-[#E2D4B7] bg-white px-3 py-2 outline-none focus:border-[#C49A2B]" />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#2C4035] px-4 py-3 font-semibold text-[#2C4035] hover:bg-[#E2D4B7]">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 rounded-xl bg-gradient-to-r from-[#2C4035] to-[#1A1A1A] px-4 py-3 font-semibold text-white disabled:opacity-50">
              {isSaving ? 'Procesando...' : 'Confirmar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ClientOrderTrackingPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const user = useAuthStore((state) => state.user);
  const selectedOrder = useOrderStore((s) => s.selectedOrder);
  const loading = useOrderStore((s) => s.loading);
  const error = useOrderStore((s) => s.error);
  const fetchOrderById = useOrderStore((s) => s.fetchOrderById);
  const payOrderAction = useOrderStore((s) => s.payOrderAction);

  const [socketConnected, setSocketConnected] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  useEffect(() => {
    if (!orderId || !user?.id) return undefined;

    const socket = io(getSocketUrl(), {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join-client', user.id);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('cambio-estado-pedido', (payload) => {
      const updatedOrder = payload?.data;
      if (String(updatedOrder?._id) === String(orderId)) {
        fetchOrderById(orderId);
        if (updatedOrder.estado === 'LISTO') {
          toast.success('Tu pedido ya está listo');
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchOrderById, orderId, user?.id]);

  const order = selectedOrder;

  const statusInfo = useMemo(() => STATUS_LABELS[order?.estado] || { label: order?.estado || 'Desconocido', badge: 'bg-[#EFE8DC] text-[#5A5146]' }, [order?.estado]);

  const currentProgress = useMemo(() => {
    if (!order) return 0;
    if (order.estado === 'CANCELADO') return 0;
    if (order.estado === 'ENTREGADO') return 4;
    if (order.estado === 'LISTO') return 3;
    return 2;
  }, [order]);

  const canPay = order?.estado === 'LISTO' && order?.metodoPago === 'PENDIENTE';

  const handlePay = async (payload) => {
    const result = await payOrderAction(orderId, payload);
    if (result.success) {
      toast.success('Pago registrado exitosamente');
      setIsPaymentOpen(false);
    } else {
      toast.error(result.error || 'No fue posible registrar el pago');
    }
  };

  if (loading && !order) {
    return <div className="min-h-screen bg-[#F8F5F0] px-6 py-14 text-center text-[#5A5146]">Cargando pedido...</div>;
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] px-6 py-14 text-center">
        <p className="font-semibold text-red-700">{error}</p>
        <button onClick={() => navigate('/cliente/pedidos/mis')} className="mt-4 rounded-xl border border-[#2C4035] px-4 py-2 font-semibold text-[#2C4035] hover:bg-[#E2D4B7]">
          Volver a mis pedidos
        </button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A] fade-in">
      <header className="border-b border-[#E2D4B7] bg-[#F8F5F0]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A]">Seguimiento de pedido</h1>
            <p className="text-sm text-[#5A5146]">Pedido {order.numeroOrden}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${socketConnected ? 'bg-[#E4EFE8] text-[#2C4035]' : 'bg-[#F8F1DF] text-[#7B5D27]'}`}>
              {socketConnected ? 'En vivo' : 'Conectando...'}
            </span>
            <button onClick={() => navigate('/cliente/pedidos/mis')} className="rounded-full border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] hover:bg-[#E2D4B7]">
              ← Mis pedidos
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <section className="rounded-2xl border border-[#E2D4B7] bg-white p-6 shadow-[0_10px_24px_rgba(61,44,30,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[#5A5146]">Estado actual</p>
              <span className={`mt-2 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusInfo.badge}`}>{statusInfo.label}</span>
            </div>
            <div className="text-sm text-[#5A5146]">
              <p><span className="font-semibold text-[#1A1A1A]">Restaurante:</span> {order.restaurantID?.name || order.restaurantID?.nombre || 'No disponible'}</p>
              <p><span className="font-semibold text-[#1A1A1A]">Mesa:</span> {order.mesaID?.numero ? `Mesa ${order.mesaID.numero}` : 'Sin mesa asignada'}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {TRACKING_STEPS.map((step, index) => {
              const stepNumber = index + 1;
              const isDone = currentProgress > stepNumber;
              const isCurrent = currentProgress === stepNumber;
              const barClass = isDone ? 'bg-[#2C4035]' : isCurrent ? 'bg-[#C49A2B]' : 'bg-[#E8D9C4]';

              return (
                <div key={`${step.label}-${index}`} className="flex flex-col items-center gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${isDone || isCurrent ? 'border-transparent text-white' : 'border-[#E2D4B7] text-[#5A5146]'} ${barClass}`}>
                    {stepNumber}
                  </div>
                  <div className="text-center text-xs font-semibold text-[#5A5146]">{step.label}</div>
                  {index < TRACKING_STEPS.length - 1 && (
                    <div className="mt-1 h-1 w-full rounded-full bg-[#E8D9C4]">
                      <div className={`h-full rounded-full ${currentProgress > stepNumber ? 'bg-[#2C4035] w-full' : 'w-0'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-2xl border border-[#E2D4B7] bg-white p-6 shadow-[0_10px_24px_rgba(61,44,30,0.08)]">
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">Resumen del pedido</h2>

            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={`${item.tipo}-${item.plato || item.menu}`} className="flex items-center justify-between rounded-xl border border-[#E8D9C4] bg-[#FAF7F2] px-4 py-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{item.nombre}</p>
                    <p className="text-sm text-[#5A5146]">{item.cantidad} x {formatCurrency(item.precioUnitario)}</p>
                  </div>
                  <p className="font-semibold text-[#1A1A1A]">{formatCurrency(item.subtotal ?? item.precioUnitario * item.cantidad)}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[#E2D4B7] bg-white p-6 shadow-[0_10px_24px_rgba(61,44,30,0.08)]">
              <h3 className="mb-4 font-['Playfair_Display'] text-xl font-bold text-[#1A1A1A]">Totales</h3>
              <div className="space-y-2 text-sm text-[#5A5146]">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-[#1A1A1A]">{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Impuesto</span><span className="font-semibold text-[#1A1A1A]">{formatCurrency(order.impuesto)}</span></div>
                <div className="flex justify-between"><span>Descuento</span><span className="font-semibold text-[#1A1A1A]">-{formatCurrency(order.descuento)}</span></div>
                <div className="flex justify-between border-t border-[#E8D9C4] pt-2 text-base font-bold text-[#1A1A1A]"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2D4B7] bg-white p-6 shadow-[0_10px_24px_rgba(61,44,30,0.08)]">
              <h3 className="mb-3 font-['Playfair_Display'] text-xl font-bold text-[#1A1A1A]">Pago</h3>
              {canPay ? (
                <button onClick={() => setIsPaymentOpen(true)} className="w-full rounded-xl bg-gradient-to-r from-[#C87A55] to-[#C49A2B] px-4 py-3 font-semibold text-white shadow-sm hover:shadow-lg">
                  Pagar
                </button>
              ) : order.metodoPago !== 'PENDIENTE' ? (
                <div className="rounded-xl bg-[#E4EFE8] px-4 py-3 text-sm font-semibold text-[#2C4035]">
                  Ya fue pagado con {order.metodoPago}
                </div>
              ) : (
                <div className="rounded-xl bg-[#F8F1DF] px-4 py-3 text-sm text-[#7B5D27]">
                  El botón de pago aparecerá cuando el pedido esté listo.
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>

      {isPaymentOpen && (
        <PaymentModal
          order={order}
          onClose={() => setIsPaymentOpen(false)}
          onConfirm={handlePay}
          isSaving={loading}
        />
      )}
    </div>
  );
};
