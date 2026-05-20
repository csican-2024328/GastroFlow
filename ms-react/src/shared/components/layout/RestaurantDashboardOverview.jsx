import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../../shared/api/orderService.js';
import { getUserReservations } from '../../../shared/api/reservationService.js';
import { getInvoices } from '../../../shared/api/invoiceService.js';
import { getIncomeReport, getTopPlatosReport } from '../../../shared/api/reportService.js';
import { useRestaurantScope } from '../../hooks/useRestaurantScope.js';

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
};

const endOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
};

const formatCurrency = (value) => new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'GTQ',
  maximumFractionDigits: 2,
}).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
};

const normalizeList = (response, nestedKeys = []) => {
  const payload = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of nestedKeys) {
    const nestedValue = payload?.[key];
    if (Array.isArray(nestedValue)) {
      return nestedValue;
    }
  }

  return [];
};

const StatCard = ({ label, value, helper, tone = 'text-[#F6E9D6]' }) => (
  <article className="rounded-3xl border border-[#4b3828] bg-[#0b0a09]/80 p-5 shadow-[0_14px_34px_rgba(0,0,0,0.6)] backdrop-blur">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A66A]">{label}</p>
    <div className="mt-3 flex items-end justify-between gap-3">
      <p className={`text-3xl font-bold ${tone}`}>{value}</p>
    </div>
    <p className="mt-2 text-sm leading-6 text-[#BFAF98]">{helper}</p>
  </article>
);

const Panel = ({ title, eyebrow, children, className = '' }) => (
  <section className={`rounded-[28px] border border-[#3f2f22] bg-[#0e0d0c]/70 shadow-[0_14px_34px_rgba(0,0,0,0.6)] ${className}`}>
    <div className="border-b border-[#2f2218] px-6 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A66A]">{eyebrow}</p>
      <h3 className="mt-2 font-['Playfair_Display'] text-2xl font-bold text-[#F6E9D6]">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const ActionLink = ({ to, label, description, accent = 'from-[#2C4035] to-[#37564E]' }) => (
  <Link
    to={to}
    className={`group flex items-start justify-between gap-4 rounded-2xl bg-gradient-to-r ${accent} p-4 text-[#F6E9D6] transition-transform duration-200 hover:-translate-y-0.5`}
  >
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 text-sm text-[#DCCFAF]">{description}</p>
    </div>
    <span className="mt-0.5 text-xl transition-transform duration-200 group-hover:translate-x-0.5">→</span>
  </Link>
);

export const RestaurantDashboardOverview = () => {
  const { restaurantId, user } = useRestaurantScope();
  const restaurantName = user?.restaurantId?.nombre || user?.restaurantId?.name || 'tu restaurante';

  const [dateStart] = useState(startOfMonth());
  const [dateEnd] = useState(endOfMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [incomeReport, setIncomeReport] = useState(null);
  const [topPlatosReport, setTopPlatosReport] = useState([]);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [ordersRes, reservationsRes, invoicesRes, incomeRes, topPlatosRes] = await Promise.all([
          getOrders({ page: 1, limit: 50, restaurantID: restaurantId || undefined, restaurantId: restaurantId || undefined }),
          getUserReservations({ page: 1, limit: 50, restaurantID: restaurantId || undefined, restaurantId: restaurantId || undefined }),
          getInvoices({ page: 1, limit: 50, fechaInicio: dateStart, fechaFin: dateEnd, restaurantID: restaurantId || undefined }),
          getIncomeReport({ start: dateStart, end: dateEnd, restaurantID: restaurantId || undefined, restaurantId: restaurantId || undefined }),
          getTopPlatosReport({ start: dateStart, end: dateEnd, limit: 5, restaurantID: restaurantId || undefined, restaurantId: restaurantId || undefined }),
        ]);

        if (!isActive) return;

        setOrders(normalizeList(ordersRes));
        setReservations(normalizeList(reservationsRes));
        setInvoices(normalizeList(invoicesRes));
        setIncomeReport(incomeRes?.data || null);
        setTopPlatosReport(normalizeList(topPlatosRes, ['topPlatos', 'platos', 'items']));
        setLastUpdated(new Date());
      } catch (err) {
        if (!isActive) return;
        setError(err?.response?.data?.message || 'No fue posible cargar el tablero del restaurante');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [dateEnd, dateStart, restaurantId]);

  const summary = useMemo(() => {
    const openOrders = orders.filter((order) => !['ENTREGADO', 'CANCELADO'].includes(order?.estado)).length;
    const pendingReservations = reservations.filter((reservation) => !['CANCELADA', 'COMPLETADA'].includes(reservation?.estado)).length;
    const paidInvoices = invoices.filter((invoice) => invoice?.estado === 'PAGADA').length;
    const totalIncome = incomeReport?.data?.resumen?.totalIngresos ?? incomeReport?.resumen?.totalIngresos ?? 0;

    return {
      openOrders,
      pendingReservations,
      paidInvoices,
      totalIncome,
    };
  }, [invoices, incomeReport, orders, reservations]);

  const recentOrders = orders.slice(0, 4);
  const upcomingReservations = reservations
    .filter((reservation) => !['CANCELADA', 'COMPLETADA'].includes(reservation?.estado))
    .slice(0, 3);
  const topPlatos = Array.isArray(topPlatosReport) ? topPlatosReport.slice(0, 3) : [];

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#2f2218] bg-gradient-to-br from-[#0b0a09] via-[#15110f] to-[#221811] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)] lg:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_right,_rgba(200,122,85,0.06),_transparent_50%),radial-gradient(circle_at_top_left,_rgba(120,95,60,0.06),_transparent_45%)]" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-6 rounded-[28px] border border-[#2b1f16] bg-[#120f0d]/60 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.6)] backdrop-blur lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C9A66A]">Tablero del restaurante</p>
            <h1 className="mt-3 font-['Playfair_Display'] text-4xl font-bold tracking-tight text-[#F6E9D6] lg:text-5xl">
              Controla pedidos, reservas e ingresos desde una sola vista.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#BFAF98] lg:text-base">
              {restaurantName} cuenta con un resumen operativo pensado para el admin de restaurante: actividad actual,
              ingresos del periodo y accesos rápidos a las tareas más frecuentes.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#3c2c20] bg-[#0f0d0b]/50 px-3 py-1 text-xs font-semibold text-[#DCCFAF]">
                Restaurante asignado
              </span>
              <span className="rounded-full border border-[#3c2c20] bg-[#0f0d0b]/50 px-3 py-1 text-xs font-semibold text-[#DCCFAF]">
                Periodo: {dateStart} a {dateEnd}
              </span>
              <span className="rounded-full border border-[#3c2c20] bg-[#0f0d0b]/50 px-3 py-1 text-xs font-semibold text-[#DCCFAF]">
                Última actualización: {lastUpdated ? formatDateTime(lastUpdated) : 'pendiente'}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px] lg:grid-cols-1">
            <ActionLink
              to="/restaurant-dashboard/pedidos"
              label="Abrir pedidos"
              description="Revisa y cambia el estado de los pedidos activos."
              accent="from-[#2C4035] to-[#37564E]"
            />
            <ActionLink
              to="/restaurant-dashboard/mesas"
              label="Gestionar mesas"
              description="Consulta disponibilidad y capacidad en tiempo real."
              accent="from-[#C87A55] to-[#B96545]"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[#5a2a2a] bg-[#2b0f0f] px-5 py-4 text-sm text-[#f1baba]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Pedidos abiertos"
            value={loading ? '...' : summary.openOrders}
            helper="Pedidos que todavía requieren atención operativa."
            tone="text-[#F6E9D6]"
          />
          <StatCard
            label="Reservas pendientes"
            value={loading ? '...' : summary.pendingReservations}
            helper="Reservaciones activas que siguen en curso."
            tone="text-[#DCCFAF]"
          />
          <StatCard
            label="Facturas pagadas"
            value={loading ? '...' : summary.paidInvoices}
            helper="Cobros confirmados dentro del periodo actual."
            tone="text-[#F6E9D6]"
          />
          <StatCard
            label="Ingresos del periodo"
            value={loading ? '...' : formatCurrency(summary.totalIncome)}
            helper="Monto consolidado del periodo seleccionado."
            tone="text-[#C9A66A]"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Movimiento reciente" eyebrow="Operación diaria">
              {loading ? (
              <p className="text-sm text-[#BFAF98]">Cargando la actividad reciente...</p>
            ) : recentOrders.length ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order._id || order.id || order.numeroOrden} className="flex items-start justify-between gap-4 rounded-2xl border border-[#2b1f16] bg-[#0b0a09]/60 p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#F6E9D6]">Pedido #{order.numeroOrden || '-'}</p>
                      <p className="mt-1 text-sm text-[#BFAF98]">
                        {order.clienteNombre || 'Cliente general'} · {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#231a12] px-3 py-1 text-xs font-semibold text-[#DCCFAF]">
                      {order.estado || 'PENDIENTE'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#BFAF98]">Todavía no hay pedidos para mostrar.</p>
            )}
          </Panel>

          <div className="space-y-6">
            <Panel title="Próximas reservaciones" eyebrow="Agenda activa">
              {loading ? (
                <p className="text-sm text-[#BFAF98]">Cargando reservaciones...</p>
              ) : upcomingReservations.length ? (
                <div className="space-y-3">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation._id || reservation.id} className="rounded-2xl border border-[#2b1f16] bg-[#0b0a09]/60 p-4">
                      <p className="text-sm font-semibold text-[#F6E9D6]">{reservation.clienteNombre || 'Reserva sin nombre'}</p>
                      <p className="mt-1 text-sm text-[#BFAF98]">
                        {formatDateTime(reservation.fechaReserva || reservation.fecha)} · Mesa {reservation.mesaNumero || reservation.mesaID?.numero || '-'}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[#2a1f12] px-3 py-1 text-xs font-semibold text-[#DCCFAF]">
                          {reservation.estado || 'PENDIENTE'}
                        </span>
                        <span className="text-xs text-[#BFAF98]">{reservation.personas || reservation.cantidadPersonas || '-'} personas</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#BFAF98]">No hay reservaciones activas en este periodo.</p>
              )}
            </Panel>

            <Panel title="Top platos" eyebrow="Menú más solicitado">
              {loading ? (
                <p className="text-sm text-[#BFAF98]">Cargando platillos destacados...</p>
              ) : topPlatos.length ? (
                <div className="space-y-3">
                  {topPlatos.map((item, index) => (
                    <div key={item._id || item.id || item.nombre || index} className="flex items-center justify-between rounded-2xl border border-[#2b1f16] bg-[#0b0a09]/60 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#F6E9D6]">{item.nombre || item.platoNombre || `Plato ${index + 1}`}</p>
                        <p className="text-xs text-[#BFAF98]">Vendidos en el periodo</p>
                      </div>
                      <span className="rounded-full bg-[#231a12] px-3 py-1 text-xs font-semibold text-[#DCCFAF]">
                        {item.total || item.cantidad || item.ventas || 0}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#BFAF98]">No hay datos de platillos para este periodo.</p>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};