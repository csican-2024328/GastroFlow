import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getUsers } from '../../../shared/api/users.js';
import { getRestaurants } from '../../../shared/api/restaurantService.js';
import { getOrders } from '../../../shared/api/orderService.js';
import { getUserReservations } from '../../../shared/api/reservationService.js';
import { getInvoices } from '../../../shared/api/invoiceService.js';
import gastroflowLogo from '../../../assets/img/Logo.png';
import {
  getDemandReport,
  getReservationsReport,
  getIncomeReport,
  getTopPlatosReport,
  getHorasPicoReport,
} from '../../../shared/api/reportService.js';

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3006/api/v1';
  return import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/v1\/?$/, '');
};

const formatCurrency = (value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-ES');
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
};

const startOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
};

const endOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
};

const BRAND_COLORS = {
  cream: [248, 245, 240],
  graphite: [26, 26, 26],
  beige: [226, 212, 183],
  green: [44, 64, 53],
  terracotta: [200, 122, 85],
};

const toDataUrl = (imageSrc) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('No se pudo generar canvas para logo'));
      return;
    }
    ctx.drawImage(image, 0, 0);
    resolve(canvas.toDataURL('image/png'));
  };
  image.onerror = () => reject(new Error('No se pudo cargar el logo para exportación'));
  image.src = imageSrc;
});

const metricCard = (label, value, helper, tone) => (
  <div className="rounded-2xl border border-[#E8D4B8] bg-white/95 p-5 shadow-[0_10px_24px_rgba(26,26,26,0.06)]">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A63]">{label}</p>
    <div className="mt-2 flex items-end justify-between gap-3">
      <p className={`text-3xl font-bold ${tone}`}>{value}</p>
    </div>
    <p className="mt-2 text-sm text-[#6D6459]">{helper}</p>
  </div>
);

const Section = ({ title, children, className = '' }) => (
  <section className={`rounded-2xl border border-[#E8D4B8] bg-white/95 shadow-[0_10px_24px_rgba(26,26,26,0.06)] ${className}`}>
    <div className="border-b border-[#F0E3CF] px-5 py-4">
      <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#1A1A1A]">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export const LiveAdminDashboard = () => {
  const [dateStart, setDateStart] = useState(startOfMonth());
  const [dateEnd, setDateEnd] = useState(endOfMonth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [demandReport, setDemandReport] = useState(null);
  const [reservationsReport, setReservationsReport] = useState(null);
  const [incomeReport, setIncomeReport] = useState(null);
  const [topPlatosReport, setTopPlatosReport] = useState(null);
  const [horasPicoReport, setHorasPicoReport] = useState(null);
  const [liveActivity, setLiveActivity] = useState([]);
  const [exportingPdf, setExportingPdf] = useState(false);
  const socketRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const requestParams = useMemo(() => ({
    start: dateStart,
    end: dateEnd,
    fechaInicio: dateStart,
    fechaFin: dateEnd,
    restaurantID: undefined,
    limit: 8,
  }), [dateStart, dateEnd]);

  const pushActivity = (message) => {
    setLiveActivity((current) => [
      { message, at: new Date().toISOString() },
      ...current,
    ].slice(0, 6));
  };

  const fetchOverview = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError('');

      const [restaurantsRes, usersRes, ordersRes, reservationsRes, invoicesRes, demandRes, reservationsReportRes, incomeRes, topPlatosRes, horasPicoRes] = await Promise.all([
        getRestaurants({ page: 1, limit: 1000, isActive: true }),
        getUsers(),
        getOrders({ page: 1, limit: 50 }),
        getUserReservations({ page: 1, limit: 50 }),
        getInvoices({ page: 1, limit: 50, fechaInicio: dateStart, fechaFin: dateEnd }),
        getDemandReport({ start: dateStart, end: dateEnd, limit: 8 }),
        getReservationsReport({ start: dateStart, end: dateEnd, restaurantID: undefined }),
        getIncomeReport({ start: dateStart, end: dateEnd }),
        getTopPlatosReport({ start: dateStart, end: dateEnd, limit: 5 }),
        getHorasPicoReport({ start: dateStart, end: dateEnd }),
      ]);

      setRestaurants(restaurantsRes?.data?.data || restaurantsRes?.data || []);
      setUsers(usersRes?.data?.data || []);
      setOrders(ordersRes?.data || []);
      setReservations(reservationsRes?.data?.data || []);
      setInvoices(invoicesRes?.data?.data || []);
      setDemandReport(demandRes?.data?.data?.demandaPorRestaurante || demandRes?.data?.demandaPorRestaurante || []);
      setReservationsReport(reservationsReportRes?.data || null);
      setIncomeReport(incomeRes?.data || null);
      setTopPlatosReport(topPlatosRes?.data?.data?.topPlatos || topPlatosRes?.data?.topPlatos || []);
      setHorasPicoReport(horasPicoRes?.data || null);
      setLastUpdated(new Date());

      const paidInvoices = invoicesRes?.data?.data?.filter((invoice) => invoice.estado === 'PAGADA')?.length || 0;
      const pendingInvoices = invoicesRes?.data?.data?.filter((invoice) => invoice.estado !== 'PAGADA')?.length || 0;
      pushActivity(`Tablero actualizado · ${reservationsRes?.data?.data?.length || 0} reservas · ${ordersRes?.data?.length || 0} pedidos · ${paidInvoices} pagos`);

      return { success: true };
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible cargar el tablero en vivo');
      return { success: false };
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [dateStart, dateEnd]);

  useEffect(() => {
    if (!restaurants.length) return undefined;

    const socket = io(getSocketUrl(), {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      restaurants.forEach((restaurant) => {
        const restaurantId = restaurant._id || restaurant.id;
        if (restaurantId) {
          socket.emit('join-restaurant', restaurantId);
        }
      });
      pushActivity('Conectado al canal en vivo del admin');
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    const refreshLive = (label) => {
      pushActivity(label);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = setTimeout(() => {
        fetchOverview({ silent: true });
      }, 400);
    };

    socket.on('nueva-reserva', () => refreshLive('Nueva reserva recibida'));
    socket.on('cambio-estado-reserva', () => refreshLive('Cambio de estado en reserva'));
    socket.on('nuevo-pedido', () => refreshLive('Nuevo pedido recibido'));
    socket.on('cambio-estado-pedido', () => refreshLive('Cambio de estado en pedido'));

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      socket.disconnect();
    };
  }, [restaurants]);

  const reservationStats = useMemo(() => {
    const items = reservationsReport?.data?.porEstado || reservationsReport?.porEstado || [];
    return items.reduce((acc, item) => {
      acc[item._id] = item.total;
      return acc;
    }, { PENDIENTE: 0, CONFIRMADA: 0, CANCELADA: 0, COMPLETADA: 0 });
  }, [reservationsReport]);

  const totalIncome = incomeReport?.data?.resumen?.totalIngresos ?? incomeReport?.resumen?.totalIngresos ?? 0;
  const totalOrders = orders.length;
  const totalPaidInvoices = invoices.filter((invoice) => invoice.estado === 'PAGADA').length;
  const totalPendingInvoices = invoices.filter((invoice) => invoice.estado !== 'PAGADA').length;
  const activeRestaurants = restaurants.filter((restaurant) => restaurant.isActive !== false).length;
  const totalReservations = reservationsReport?.data?.resumen?.totalReservaciones ?? reservationsReport?.resumen?.totalReservaciones ?? reservations.length;
  const pendingReservations = reservationStats.PENDIENTE || 0;
  const confirmedReservations = reservationStats.CONFIRMADA || 0;
  const cancelledReservations = reservationStats.CANCELADA || 0;

  const topRestaurant = demandReport?.[0];
  const topDish = topPlatosReport?.[0];
  const peakHour = horasPicoReport?.data?.horaPico || horasPicoReport?.horaPico;

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.createdAt || b.fechaReserva) - new Date(a.createdAt || a.fechaReserva))
    .slice(0, 6);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const recentPayments = [...invoices]
    .sort((a, b) => new Date(b.fechaEmision || b.createdAt) - new Date(a.fechaEmision || a.createdAt))
    .slice(0, 6);

  const recentUsers = [...users].slice(0, 6);

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);

      const exportTimestamp = new Date();
      const logoDataUrl = await toDataUrl(gastroflowLogo);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(...BRAND_COLORS.cream);
      doc.rect(0, 0, pageWidth, 130, 'F');

      doc.addImage(logoDataUrl, 'PNG', 36, 24, 72, 72);

      doc.setTextColor(...BRAND_COLORS.green);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('GastroFlow', 118, 58);

      doc.setFontSize(16);
      doc.text('Panel Central de Reporte', 118, 82);

      doc.setTextColor(...BRAND_COLORS.graphite);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Rango: ${formatDate(dateStart)} - ${formatDate(dateEnd)}`, 118, 102);
      doc.text(`Exportado: ${formatDateTime(exportTimestamp)}`, 118, 118);

      autoTable(doc, {
        startY: 150,
        head: [['Indicador', 'Valor']],
        body: [
          ['Ingresos', formatCurrency(totalIncome)],
          ['Reservas totales', String(totalReservations)],
          ['Reservas pendientes', String(pendingReservations)],
          ['Reservas aceptadas', String(confirmedReservations)],
          ['Reservas canceladas', String(cancelledReservations)],
          ['Pedidos', String(totalOrders)],
          ['Pagos completados', String(totalPaidInvoices)],
          ['Pagos pendientes', String(totalPendingInvoices)],
          ['Restaurantes activos', String(activeRestaurants)],
          ['Usuarios registrados', String(users.length)],
        ],
        styles: { fontSize: 10, cellPadding: 6, textColor: BRAND_COLORS.graphite },
        headStyles: { fillColor: BRAND_COLORS.green, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [252, 249, 243] },
        columnStyles: {
          0: { fontStyle: 'bold' },
        },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Reservación', 'Cliente', 'Estado', 'Fecha']],
        body: recentReservations.map((reservation) => [
          reservation._id?.slice(-8).toUpperCase() || '-',
          reservation.clienteNombre || '-',
          reservation.estado || '-',
          formatDate(reservation.fechaReserva),
        ]),
        styles: { fontSize: 9, cellPadding: 5, textColor: BRAND_COLORS.graphite },
        headStyles: { fillColor: BRAND_COLORS.terracotta, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [252, 249, 243] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Pedido', 'Restaurante', 'Estado', 'Total']],
        body: recentOrders.map((order) => [
          order.numeroOrden || order._id?.slice(-6) || '-',
          order.restaurantID?.nombre || order.restaurantID?.name || '-',
          order.estado || '-',
          formatCurrency(order.total),
        ]),
        styles: { fontSize: 9, cellPadding: 5, textColor: BRAND_COLORS.graphite },
        headStyles: { fillColor: BRAND_COLORS.green, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [252, 249, 243] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Factura', 'Estado', 'Método pago', 'Monto']],
        body: recentPayments.map((invoice) => [
          invoice._id?.slice(-8).toUpperCase() || '-',
          invoice.estado || '-',
          invoice.metodoPago || 'PENDIENTE',
          formatCurrency(invoice.total),
        ]),
        styles: { fontSize: 9, cellPadding: 5, textColor: BRAND_COLORS.graphite },
        headStyles: { fillColor: BRAND_COLORS.graphite, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [252, 249, 243] },
      });

      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...BRAND_COLORS.graphite);
        doc.text(`GastroFlow · Elegancia culinaria · Página ${page}/${pageCount}`, 36, pageHeight - 20);
      }

      const filename = `gastroflow-panel-central-${exportTimestamp.toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`;
      doc.save(filename);
      pushActivity('Exportación PDF generada correctamente');
    } catch (exportError) {
      setError(exportError?.message || 'No se pudo generar la exportación PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#F7F2E8_0%,#FDFBF7_45%,#F7F2E8_100%)] px-6 py-6 text-[#1A1A1A]">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A7A63]">Admin general</p>
          <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#1A1A1A]">Panel central De Reporte</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#6D6459]">
            Reservas, pedidos, compras y pagos sincronizados con datos reales del proyecto.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#E8D4B8] bg-white/90 px-4 py-3 shadow-[0_10px_24px_rgba(26,26,26,0.06)]">
          <label className="text-sm text-[#5A5146]">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A63]">Fecha inicio</span>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="rounded-lg border border-[#D9C7AC] bg-white px-3 py-2 text-sm outline-none focus:border-[#2C4035]" />
          </label>
          <label className="text-sm text-[#5A5146]">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A63]">Fecha fin</span>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="rounded-lg border border-[#D9C7AC] bg-white px-3 py-2 text-sm outline-none focus:border-[#2C4035]" />
          </label>
          <button
            onClick={() => fetchOverview()}
            className="rounded-xl bg-[#2C4035] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#23342B]"
          >
            Actualizar
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="rounded-xl bg-[#C87A55] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B66B4A] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {exportingPdf ? 'Exportando...' : 'Exportación PDF'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#E8D4B8] bg-white/90 px-4 py-3 text-sm shadow-[0_10px_24px_rgba(26,26,26,0.05)]">
        <div className="flex flex-wrap items-center gap-2 text-[#5A5146]">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>{socketConnected ? 'Conectado en vivo' : 'Conectando al socket'}</span>
          <span className="text-[#A38B6D]">·</span>
          <span>{lastUpdated ? `Última actualización ${lastUpdated.toLocaleTimeString('es-ES')}` : 'Sin actualizar aún'}</span>
        </div>
        <div className="text-xs text-[#8A7A63]">{loading ? 'Cargando datos del proyecto...' : 'Datos listos'}</div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5 md:grid-cols-2">
        {metricCard('Ingresos', formatCurrency(totalIncome), 'Ingresos acumulados en el rango', 'text-[#2C4035]')}
        {metricCard('Reservas', String(totalReservations), `${pendingReservations} pendientes · ${confirmedReservations} aceptadas`, 'text-[#1A1A1A]')}
        {metricCard('Pedidos', String(totalOrders), 'Pedidos registrados en el sistema', 'text-[#C87A55]')}
        {metricCard('Pagos', String(totalPaidInvoices), `${totalPendingInvoices} pendientes de pago`, 'text-[#7B5D27]')}
        {metricCard('Restaurantes', String(activeRestaurants), 'Locales activos en la plataforma', 'text-[#2D4F4F]')}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Section title="Reservaciones por estado">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-[#1A1A1A]">Resumen</p>
                <span className="text-xs text-[#8A7A63]">{formatDate(dateStart)} - {formatDate(dateEnd)}</span>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['PENDIENTE', 'Pendientes', pendingReservations, 'bg-amber-100 text-amber-800'],
                  ['CONFIRMADA', 'Confirmadas', confirmedReservations, 'bg-emerald-100 text-emerald-800'],
                  ['CANCELADA', 'Canceladas', cancelledReservations, 'bg-red-100 text-red-800'],
                ].map(([key, label, value, cls]) => (
                  <div key={key} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 border border-[#F0E3CF]">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>
                    <span className="font-bold text-[#1A1A1A]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-4">
              <p className="mb-3 font-semibold text-[#1A1A1A]">Por día</p>
              <div className="space-y-2">
                {(reservationsReport?.data?.porDia || reservationsReport?.porDia || []).slice(-5).map((row) => {
                  const total = row.total || 0;
                  return (
                    <div key={row.fecha} className="flex items-center gap-3 text-sm">
                      <span className="w-24 shrink-0 text-[#5A5146]">{formatDate(row.fecha)}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EFE2CF]">
                        <div className="h-full rounded-full bg-[#2C4035]" style={{ width: `${Math.min(total * 12, 100)}%` }} />
                      </div>
                      <span className="w-8 text-right font-semibold text-[#1A1A1A]">{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Pedidos recientes">
          <div className="overflow-hidden rounded-2xl border border-[#F0E3CF]">
            <table className="w-full text-sm">
              <thead className="bg-[#F4E9D5] text-left text-[#6D5D45]">
                <tr>
                  <th className="px-3 py-2">Orden</th>
                  <th className="px-3 py-2">Restaurante</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-t border-[#F3E7D7]">
                    <td className="px-3 py-2 font-medium text-[#1A1A1A]">{order.numeroOrden || order._id?.slice(-6)}</td>
                    <td className="px-3 py-2 text-[#5A5146]">{order.restaurantID?.nombre || order.restaurantID?.name || '-'}</td>
                    <td className="px-3 py-2 text-[#2C4035]">{order.estado || '-'}</td>
                    <td className="px-3 py-2 font-semibold text-[#1A1A1A]">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan="4" className="px-3 py-4 text-center text-[#8A7A63]">Sin pedidos para mostrar</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Section title="Pagos y facturas">
          <div className="overflow-hidden rounded-2xl border border-[#F0E3CF]">
            <table className="w-full text-sm">
              <thead className="bg-[#F4E9D5] text-left text-[#6D5D45]">
                <tr>
                  <th className="px-3 py-2">Factura</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Pago</th>
                  <th className="px-3 py-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((invoice) => (
                  <tr key={invoice._id} className="border-t border-[#F3E7D7]">
                    <td className="px-3 py-2 font-medium text-[#1A1A1A]">{invoice._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-3 py-2 text-[#5A5146]">{invoice.estado || '-'}</td>
                    <td className="px-3 py-2 text-[#2C4035]">{invoice.metodoPago || 'PENDIENTE'}</td>
                    <td className="px-3 py-2 font-semibold text-[#1A1A1A]">{formatCurrency(invoice.total)}</td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr><td colSpan="4" className="px-3 py-4 text-center text-[#8A7A63]">Sin facturas para mostrar</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Top de negocio">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A63]">Restaurante líder</p>
              <p className="mt-2 font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">{topRestaurant?.restaurante || 'Sin datos'}</p>
              <p className="mt-1 text-sm text-[#5A5146]">{topRestaurant ? `${topRestaurant.totalPedidos} pedidos · ${topRestaurant.totalReservaciones} reservas` : 'Aún no hay datos suficientes'}</p>
              <p className="mt-3 text-sm font-semibold text-[#2C4035]">{topRestaurant ? formatCurrency(topRestaurant.ingresos) : '$0.00'}</p>
            </div>
            <div className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A63]">Plato más vendido</p>
              <p className="mt-2 font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">{topDish?.nombre || 'Sin datos'}</p>
              <p className="mt-1 text-sm text-[#5A5146]">{topDish ? `${topDish.totalVendidos} vendidos` : 'Aún no hay ventas registradas'}</p>
              <p className="mt-3 text-sm font-semibold text-[#2C4035]">{topDish ? formatCurrency(topDish.ingresos) : '$0.00'}</p>
            </div>
            <div className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A63]">Hora pico</p>
              <p className="mt-2 font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">{peakHour?.hora !== undefined ? `${String(peakHour.hora).padStart(2, '0')}:00` : 'Sin datos'}</p>
              <p className="mt-1 text-sm text-[#5A5146]">{peakHour ? `${peakHour.demandaTotal} eventos combinados` : 'No hay suficiente actividad para calcularla'}</p>
            </div>
            <div className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A63]">Usuarios</p>
              <p className="mt-2 font-['Playfair_Display'] text-2xl font-bold text-[#1A1A1A]">{users.length}</p>
              <p className="mt-1 text-sm text-[#5A5146]">Usuarios registrados en el sistema</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Section title="Reservaciones recientes">
          <div className="space-y-3">
            {recentReservations.map((reservation) => (
              <div key={reservation._id} className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{reservation.clienteNombre}</p>
                    <p className="text-sm text-[#5A5146]">{reservation.restaurantID?.name || reservation.restaurantID?.nombre || '-'}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#2C4035] border border-[#D6E7DA]">{reservation.estado}</span>
                </div>
                <p className="mt-2 text-sm text-[#5A5146]">{formatDate(reservation.fechaReserva)} · {reservation.horaInicio} - {reservation.horaFin}</p>
              </div>
            ))}
            {recentReservations.length === 0 && <p className="text-sm text-[#8A7A63]">Sin reservaciones para mostrar</p>}
          </div>
        </Section>

        <Section title="Clientes y actividad">
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id || user._id || user.email} className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-3">
                <p className="font-semibold text-[#1A1A1A]">{user.username || user.name || 'Usuario'}</p>
                <p className="text-sm text-[#5A5146]">{user.email}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8A7A63]">{user.role || 'SIN ROL'}</p>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="text-sm text-[#8A7A63]">No hay usuarios cargados</p>}
          </div>
        </Section>

        <Section title="Actividad en vivo">
          <div className="space-y-3">
            {liveActivity.map((entry, index) => (
              <div key={`${entry.at}-${index}`} className="rounded-2xl border border-[#F0E3CF] bg-[#FBF8F2] p-3 text-sm text-[#5A5146]">
                <p className="font-semibold text-[#1A1A1A]">{entry.message}</p>
                <p className="mt-1 text-xs text-[#8A7A63]">{formatDateTime(entry.at)}</p>
              </div>
            ))}
            {liveActivity.length === 0 && <p className="text-sm text-[#8A7A63]">Esperando actividad en vivo...</p>}
          </div>
        </Section>
      </div>
    </div>
  );
};