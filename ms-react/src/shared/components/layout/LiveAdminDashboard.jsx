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
import '../../../styles/dashboard-admin.css';
 
/* ─────────────────────────────────────────────────────
   HELPERS — TODOS INTACTOS
───────────────────────────────────────────────────── */
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3006/api/v1';
  return import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/v1\/?$/, '');
};
 
const formatCurrency = (value) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(Number(value || 0));
 
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
 
const toDataUrl = (imageSrc) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No se pudo generar canvas para logo')); return; }
      ctx.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('No se pudo cargar el logo para exportación'));
    image.src = imageSrc;
  });
 
/* Iniciales a partir de un string */
const initials = (str = '') =>
  str.trim().split(/[\s_-]+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
 
/* ─────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────── */
export const LiveAdminDashboard = ({ restaurantId = '' }) => {
  const scopedRestaurantId = (restaurantId || '').toString().trim();
  const isScoped = Boolean(scopedRestaurantId);
 
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
    restaurantID: scopedRestaurantId || undefined,
    restaurantId: scopedRestaurantId || undefined,
    limit: 8,
  }), [dateStart, dateEnd, scopedRestaurantId]);
 
  const pushActivity = (message) => {
    setLiveActivity((current) =>
      [{ message, at: new Date().toISOString() }, ...current].slice(0, 6)
    );
  };
 
  const fetchOverview = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError('');
 
      const [restaurantsRes, usersRes, ordersRes, reservationsRes, invoicesRes,
        demandRes, reservationsReportRes, incomeRes, topPlatosRes, horasPicoRes] =
        await Promise.all([
          isScoped
            ? Promise.resolve({ data: { data: [{ _id: scopedRestaurantId, id: scopedRestaurantId, isActive: true }] } })
            : getRestaurants({ page: 1, limit: 1000, isActive: true }),
          getUsers(),
          getOrders({ page: 1, limit: 50, restaurantID: scopedRestaurantId || undefined, restaurantId: scopedRestaurantId || undefined }),
          getUserReservations({ page: 1, limit: 50, restaurantID: scopedRestaurantId || undefined, restaurantId: scopedRestaurantId || undefined }),
          getInvoices({ page: 1, limit: 50, fechaInicio: dateStart, fechaFin: dateEnd, restaurantID: scopedRestaurantId || undefined }),
          getDemandReport({ start: dateStart, end: dateEnd, limit: 8, restaurantID: scopedRestaurantId || undefined, restaurantId: scopedRestaurantId || undefined }),
          getReservationsReport({ start: dateStart, end: dateEnd, restaurantID: scopedRestaurantId || undefined, restaurantId: scopedRestaurantId || undefined }),
          getIncomeReport({ start: dateStart, end: dateEnd, restaurantID: scopedRestaurantId || undefined, restaurantId: scopedRestaurantId || undefined }),
          getTopPlatosReport({ start: dateStart, end: dateEnd, limit: 5, restaurantID: scopedRestaurantId || undefined, restaurantId: scopedRestaurantId || undefined }),
          getHorasPicoReport({ start: dateStart, end: dateEnd, restaurantID: scopedRestaurantId || undefined, restaurantId: scopedRestaurantId || undefined }),
        ]);
 
      const restaurantList = restaurantsRes?.data?.data || restaurantsRes?.data || [];
      setRestaurants(Array.isArray(restaurantList) ? restaurantList : []);
 
      const userList = usersRes?.data?.data || [];
      const restaurantUsers = isScoped
        ? userList.filter((user) => {
            const uid = user?.restaurantId?._id || user?.restaurantId || user?.RestaurantId?._id || user?.RestaurantId || '';
            return uid?.toString?.() === scopedRestaurantId;
          })
        : userList;
 
      setUsers(restaurantUsers);
      setOrders(ordersRes?.data?.data || ordersRes?.data || []);
      setReservations(reservationsRes?.data?.data || reservationsRes?.data || []);
      setInvoices(invoicesRes?.data?.data || invoicesRes?.data || []);
      setDemandReport(demandRes?.data?.data?.demandaPorRestaurante || demandRes?.data?.demandaPorRestaurante || []);
      setReservationsReport(reservationsReportRes?.data || null);
      setIncomeReport(incomeRes?.data || null);
      setTopPlatosReport(topPlatosRes?.data?.data?.topPlatos || topPlatosRes?.data?.topPlatos || []);
      setHorasPicoReport(horasPicoRes?.data || null);
      setLastUpdated(new Date());
 
      const invoiceList = invoicesRes?.data?.data || invoicesRes?.data || [];
      const paidInvoices = invoiceList.filter((i) => i.estado === 'PAGADA')?.length || 0;
      pushActivity(
        `Tablero actualizado${isScoped ? ' para tu restaurante' : ''} · ${reservationsRes?.data?.data?.length || reservationsRes?.data?.length || 0} reservas · ${ordersRes?.data?.data?.length || ordersRes?.data?.length || 0} pedidos · ${paidInvoices} pagos`
      );
 
      return { success: true };
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible cargar el tablero en vivo');
      return { success: false };
    } finally {
      if (!silent) setLoading(false);
    }
  };
 
  useEffect(() => { fetchOverview(); }, [dateStart, dateEnd]);
 
  useEffect(() => {
    if (!restaurants.length) return undefined;
 
    const socket = io(getSocketUrl(), { transports: ['websocket'], withCredentials: true });
    socketRef.current = socket;
 
    socket.on('connect', () => {
      setSocketConnected(true);
      restaurants.forEach((r) => {
        const rid = r._id || r.id;
        if (rid) socket.emit('join-restaurant', rid);
      });
      pushActivity('Conectado al canal en vivo del admin');
    });
    socket.on('disconnect', () => setSocketConnected(false));
 
    const refreshLive = (label) => {
      pushActivity(label);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => fetchOverview({ silent: true }), 400);
    };
 
    socket.on('nueva-reserva',          () => refreshLive('Nueva reserva recibida'));
    socket.on('cambio-estado-reserva',  () => refreshLive('Cambio de estado en reserva'));
    socket.on('nuevo-pedido',           () => refreshLive('Nuevo pedido recibido'));
    socket.on('cambio-estado-pedido',   () => refreshLive('Cambio de estado en pedido'));
 
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      socket.disconnect();
    };
  }, [restaurants]);
 
  /* ── Métricas derivadas — INTACTAS ── */
  const reservationStats = useMemo(() => {
    const items = reservationsReport?.data?.porEstado || reservationsReport?.porEstado || [];
    return items.reduce((acc, item) => { acc[item._id] = item.total; return acc; },
      { PENDIENTE: 0, CONFIRMADA: 0, CANCELADA: 0, COMPLETADA: 0 });
  }, [reservationsReport]);
 
  const totalIncome          = incomeReport?.data?.resumen?.totalIngresos ?? incomeReport?.resumen?.totalIngresos ?? 0;
  const totalOrders          = orders.length;
  const totalPaidInvoices    = invoices.filter((i) => i.estado === 'PAGADA').length;
  const totalPendingInvoices = invoices.filter((i) => i.estado !== 'PAGADA').length;
  const activeRestaurants    = isScoped ? 1 : restaurants.filter((r) => r.isActive !== false).length;
  const totalReservations    = reservationsReport?.data?.resumen?.totalReservaciones ?? reservationsReport?.resumen?.totalReservaciones ?? reservations.length;
  const pendingReservations  = reservationStats.PENDIENTE || 0;
  const confirmedReservations= reservationStats.CONFIRMADA || 0;
  const cancelledReservations= reservationStats.CANCELADA || 0;
 
  const topRestaurant = demandReport?.[0];
  const topDish       = topPlatosReport?.[0];
  const peakHour      = horasPicoReport?.data?.horaPico || horasPicoReport?.horaPico;
  const visibleUsers  = isScoped
    ? users.filter((u) => {
        const uid = u?.restaurantId?._id || u?.restaurantId || u?.RestaurantId?._id || u?.RestaurantId || '';
        return uid?.toString?.() === scopedRestaurantId;
      })
    : users;
 
  const recentReservations = [...reservations].sort((a, b) => new Date(b.createdAt || b.fechaReserva) - new Date(a.createdAt || a.fechaReserva)).slice(0, 6);
  const recentOrders       = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const recentPayments     = [...invoices].sort((a, b) => new Date(b.fechaEmision || b.createdAt) - new Date(a.fechaEmision || a.createdAt)).slice(0, 6);
  const recentUsers        = [...visibleUsers].slice(0, 6);
 
  /* ── Export PDF — INTACTO ── */
  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      const exportTimestamp = new Date();
      const logoDataUrl = await toDataUrl(gastroflowLogo);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
 
      doc.setFillColor(...BRAND_COLORS.cream);
      doc.rect(0, 0, pageWidth, 140, 'F');
      doc.addImage(logoDataUrl, 'PNG', 36, 26, 72, 72);
      doc.setTextColor(...BRAND_COLORS.green);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('GastroFlow', 118, 58);
      doc.setFontSize(16);
      doc.text('Resumen Ejecutivo', 118, 82);
      doc.setTextColor(...BRAND_COLORS.graphite);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Rango: ${formatDate(dateStart)} - ${formatDate(dateEnd)}`, 118, 102);
      doc.text(`Exportado: ${formatDateTime(exportTimestamp)}`, 118, 118);
 
      const demandaTotal = Array.isArray(demandReport) ? demandReport.reduce((s, r) => s + (r.totalPedidos || 0), 0) : 0;
      const pedidosPorDiaTotal = (reservationsReport?.data?.porDia || reservationsReport?.porDia || []).reduce((s, r) => s + (r.total || 0), 0);
 
      autoTable(doc, {
        startY: 150,
        head: [['Indicador', 'Valor']],
        body: [
          ['Demanda total (pedidos)', String(demandaTotal)],
          ['Platos más vendidos', (Array.isArray(topPlatosReport) && topPlatosReport.length) ? topPlatosReport.slice(0, 3).map((p) => p.nombre || p.nombrePlato || p.nombre_plato).join(', ') : 'Sin datos'],
          ['Horas pico', peakHour?.hora !== undefined ? `${String(peakHour.hora).padStart(2, '0')}:00` : 'Sin datos'],
          ['Reservaciones totales', String(totalReservations)],
          ['Ingresos globales', formatCurrency(totalIncome)],
          ['Pedidos por día (totales)', String(pedidosPorDiaTotal)],
        ],
        styles: { fontSize: 10, cellPadding: 6, textColor: BRAND_COLORS.graphite },
        headStyles: { fillColor: BRAND_COLORS.green, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [252, 249, 243] },
        columnStyles: { 0: { fontStyle: 'bold' } },
      });
 
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Reservación', 'Cliente', 'Estado', 'Fecha']],
        body: recentReservations.map((r) => [r._id?.slice(-8).toUpperCase() || '-', r.clienteNombre || '-', r.estado || '-', formatDate(r.fechaReserva)]),
        styles: { fontSize: 9, cellPadding: 5, textColor: BRAND_COLORS.graphite },
        headStyles: { fillColor: BRAND_COLORS.terracotta, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [252, 249, 243] },
      });
 
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Pedido', 'Restaurante', 'Estado', 'Total']],
        body: recentOrders.map((o) => [o.numeroOrden || o._id?.slice(-6) || '-', o.restaurantID?.nombre || o.restaurantID?.name || '-', o.estado || '-', formatCurrency(o.total)]),
        styles: { fontSize: 9, cellPadding: 5, textColor: BRAND_COLORS.graphite },
        headStyles: { fillColor: BRAND_COLORS.green, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [252, 249, 243] },
      });
 
      for (let i = 0; i < restaurants.length; i += 1) {
        const r = restaurants[i];
        const rid = r._id || r.id || r.restaurantId || r.idRestaurante;
        const rname = r.nombre || r.name || r.restaurantName || `Restaurante ${i + 1}`;
        doc.addPage();
        doc.setFillColor(...BRAND_COLORS.cream);
        doc.rect(0, 0, pageWidth, 60, 'F');
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND_COLORS.graphite);
        doc.text(rname, 36, 48);
 
        const de = Array.isArray(demandReport) ? demandReport.find((d) => (d._id && String(d._id) === String(rid)) || d.restaurante === rname) : null;
        let dias = 1;
        try { const s = new Date(dateStart); const e = new Date(dateEnd); dias = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24) + 1)); } catch {}
 
        autoTable(doc, {
          startY: 86,
          head: [['Métrica', 'Valor']],
          body: [
            ['Ingresos', formatCurrency(de?.ingresos ?? 0)],
            ['Pedidos totales', String(de?.totalPedidos ?? 0)],
            ['Pedidos por día (promedio)', dias ? (Number(de?.totalPedidos ?? 0) / dias).toFixed(2) : '-'],
            ['Platos más vendidos', (Array.isArray(topPlatosReport) && topPlatosReport.length) ? topPlatosReport.slice(0, 5).map((p) => p.nombre || p.plato || p.nombrePlato).join(', ') : 'Sin datos'],
            ['Reservaciones', String(de?.totalReservaciones ?? 0)],
          ],
          styles: { fontSize: 10, cellPadding: 6, textColor: BRAND_COLORS.graphite },
          headStyles: { fillColor: BRAND_COLORS.terracotta, textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [252, 249, 243] },
          columnStyles: { 0: { fontStyle: 'bold' } },
        });
      }
 
      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...BRAND_COLORS.graphite);
        doc.text(`GastroFlow · Elegancia culinaria · Página ${page}/${pageCount}`, 36, doc.internal.pageSize.getHeight() - 20);
      }
 
      doc.save(`gastroflow-panel-central-${exportTimestamp.toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`);
      pushActivity('Exportación PDF generada correctamente');
    } catch (exportError) {
      setError(exportError?.message || 'No se pudo generar la exportación PDF');
    } finally {
      setExportingPdf(false);
    }
  };
 
  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div className="da-root">
 
      {/* ── HEADER ── */}
      <div className="da-header">
        <div className="da-header-text">
          <div className="da-header-badge">
            <i className="ti ti-shield-check" aria-hidden="true" />
            {isScoped ? 'Admin restaurante' : 'Admin general'}
          </div>
          <h1 className="da-header-title">
            {isScoped ? 'Panel de tu restaurante' : 'Panel central de Reporte'}
          </h1>
          <p className="da-header-sub">
            {isScoped
              ? 'Reservas, pedidos, inventario y reportes filtrados por tu restaurante asignado.'
              : 'Reservas, pedidos, compras y pagos sincronizados con datos reales del proyecto.'}
          </p>
        </div>
 
        <div className="da-date-controls">
          <div className="da-date-field">
            <span className="da-date-label">Fecha inicio</span>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="da-date-input" />
          </div>
          <div className="da-date-field">
            <span className="da-date-label">Fecha fin</span>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="da-date-input" />
          </div>
          <div className="da-date-sep" />
          <button onClick={() => fetchOverview()} className="da-btn da-btn-update">
            <i className="ti ti-refresh" aria-hidden="true" />Actualizar
          </button>
          <button onClick={handleExportPdf} disabled={exportingPdf} className="da-btn da-btn-pdf">
            <i className="ti ti-file-type-pdf" aria-hidden="true" />
            {exportingPdf ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>
 
      {/* ── STATUS BAR ── */}
      <div className="da-statusbar">
        <div className="da-statusbar-left">
          <span className={`da-socket-dot ${socketConnected ? 'da-socket-dot--live' : 'da-socket-dot--pending'}`} />
          <span>{socketConnected ? 'Conectado en vivo' : 'Conectando al socket'}</span>
          <span style={{ color: 'rgba(200,140,40,0.3)' }}>·</span>
          <span>{lastUpdated ? `Última actualización ${lastUpdated.toLocaleTimeString('es-ES')}` : 'Sin actualizar aún'}</span>
        </div>
        <div className="da-statusbar-right">
          <i className="ti ti-circle-check" aria-hidden="true" />
          {loading ? 'Cargando datos...' : 'Datos listos'}
        </div>
      </div>
 
      {/* ── ERROR ── */}
      {error && (
        <div className="da-error">
          <i className="ti ti-alert-triangle" style={{ fontSize: 16 }} aria-hidden="true" />
          {error}
        </div>
      )}
 
      {/* ══ MÉTRICAS ══ */}
      <div className="da-metrics">
        {/* Ingresos */}
        <div className="da-metric-card da-metric-card--gold">
          <div className="da-metric-top">
            <div className="da-metric-icon"><i className="ti ti-currency-dollar" aria-hidden="true" /></div>
            <span className="da-metric-trend da-metric-trend--up"><i className="ti ti-trending-up" style={{ fontSize: 11 }} aria-hidden="true" />+0%</span>
          </div>
          <div className="da-metric-label">Ingresos</div>
          <div className="da-metric-value da-metric-value--gold">{formatCurrency(totalIncome)}</div>
          <div className="da-metric-helper">Ingresos acumulados en el rango</div>
          <div className="da-sparkline">
            {[40, 55, 35, 65, 50, 80, 45].map((h, i) => (
              <div key={i} className={`da-spark-bar${h === 80 ? ' da-spark-bar--hi' : ''}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
 
        {/* Reservas */}
        <div className="da-metric-card">
          <div className="da-metric-top">
            <div className="da-metric-icon"><i className="ti ti-calendar-event" aria-hidden="true" /></div>
            <span className="da-metric-trend">{totalReservations > 0 ? `+${totalReservations}` : '—'}</span>
          </div>
          <div className="da-metric-label">Reservas</div>
          <div className="da-metric-value">{totalReservations}</div>
          <div className="da-metric-helper">{pendingReservations} pendientes · {confirmedReservations} aceptadas</div>
        </div>
 
        {/* Pedidos */}
        <div className="da-metric-card da-metric-card--red">
          <div className="da-metric-top">
            <div className="da-metric-icon da-metric-icon--red"><i className="ti ti-shopping-bag" aria-hidden="true" /></div>
            <span className="da-metric-trend">{totalOrders > 0 ? `${totalOrders} total` : '—'}</span>
          </div>
          <div className="da-metric-label">Pedidos</div>
          <div className="da-metric-value da-metric-value--red">{totalOrders}</div>
          <div className="da-metric-helper">Pedidos registrados en el sistema</div>
        </div>
 
        {/* Pagos */}
        <div className="da-metric-card da-metric-card--gold">
          <div className="da-metric-top">
            <div className="da-metric-icon"><i className="ti ti-credit-card" aria-hidden="true" /></div>
            <span className="da-metric-trend">{totalPendingInvoices > 0 ? `${totalPendingInvoices} pend.` : '—'}</span>
          </div>
          <div className="da-metric-label">Pagos</div>
          <div className="da-metric-value da-metric-value--gold">{totalPaidInvoices}</div>
          <div className="da-metric-helper">{totalPendingInvoices} pendientes de pago</div>
        </div>
 
        {/* Restaurantes */}
        <div className="da-metric-card da-metric-card--green">
          <div className="da-metric-top">
            <div className="da-metric-icon da-metric-icon--green"><i className="ti ti-building-store" aria-hidden="true" /></div>
            <span className="da-metric-trend da-metric-trend--up">{visibleUsers.length} users</span>
          </div>
          <div className="da-metric-label">Restaurantes</div>
          <div className="da-metric-value da-metric-value--green">{activeRestaurants}</div>
          <div className="da-metric-helper">{isScoped ? 'Tu restaurante asignado' : 'Locales activos en la plataforma'}</div>
        </div>
      </div>
 
      {/* ══ FILA 1: Reservaciones + Pedidos ══ */}
      <div className="da-grid-2">
 
        {/* Reservaciones por estado */}
        <div className="da-section">
          <div className="da-section-header">
            <h3 className="da-section-title">Reservaciones por estado</h3>
            <span className="da-section-badge">{formatDate(dateStart)} – {formatDate(dateEnd)}</span>
          </div>
          <div className="da-section-body">
            <div className="da-grid-2" style={{ marginBottom: 0 }}>
              {/* Resumen */}
              <div className="da-res-rows">
                {[
                  { key: 'PENDIENTE',  label: 'Pendientes',  value: pendingReservations,   cls: 'da-badge--gold',  bar: '#c88c28', num: 'da-text-gold'  },
                  { key: 'CONFIRMADA', label: 'Confirmadas', value: confirmedReservations,  cls: 'da-badge--green', bar: '#64b464', num: 'da-text-green' },
                  { key: 'CANCELADA',  label: 'Canceladas',  value: cancelledReservations,  cls: 'da-badge--red',   bar: '#e06060', num: 'da-text-red'  },
                ].map(({ key, label, value, cls, bar, num }) => (
                  <div key={key} className="da-res-row">
                    <span className={`da-badge ${cls}`}>{label}</span>
                    <div className="da-res-bar-wrap">
                      <div className="da-res-bar" style={{ width: `${Math.min(value * 15, 100)}%`, background: bar }} />
                    </div>
                    <span className={`da-res-num ${num}`}>{value}</span>
                  </div>
                ))}
              </div>
              {/* Por día */}
              <div>
                <p className="da-metric-label" style={{ marginBottom: 10 }}>Por día</p>
                {(reservationsReport?.data?.porDia || reservationsReport?.porDia || []).slice(-5).map((row) => (
                  <div key={row.fecha} className="da-day-bar-row">
                    <span className="da-day-label">{formatDate(row.fecha)}</span>
                    <div className="da-day-track">
                      <div className="da-day-fill" style={{ width: `${Math.min((row.total || 0) * 12, 100)}%` }} />
                    </div>
                    <span className="da-day-count">{row.total || 0}</span>
                  </div>
                ))}
                {!(reservationsReport?.data?.porDia || reservationsReport?.porDia || []).length && (
                  <p style={{ fontSize: 11, color: 'rgba(245,237,224,0.18)', textAlign: 'center', paddingTop: 12 }}>Sin datos por día</p>
                )}
              </div>
            </div>
          </div>
        </div>
 
        {/* Pedidos recientes */}
        <div className="da-section">
          <div className="da-section-header">
            <h3 className="da-section-title">Pedidos recientes</h3>
            <span className="da-section-badge">Últimos {recentOrders.length}</span>
          </div>
          <div className="da-section-body">
            <div className="da-table-wrap">
              <table className="da-table">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }}>Orden</th>
                    <th style={{ width: '32%' }}>Restaurante</th>
                    <th style={{ width: '24%' }}>Estado</th>
                    <th style={{ width: '22%', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="da-td-main">{order.numeroOrden || order._id?.slice(-6)}</td>
                      <td>{order.restaurantID?.nombre || order.restaurantID?.name || '-'}</td>
                      <td>{order.estado || '-'}</td>
                      <td className="da-td-gold da-td-right">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                  {!recentOrders.length && (
                    <tr><td colSpan="4" className="da-table-empty">
                      <i className="ti ti-shopping-cart-off" aria-hidden="true" />
                      Sin pedidos para mostrar
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
 
      {/* ══ FILA 2: Pagos + Top negocio ══ */}
      <div className="da-grid-2">
 
        {/* Pagos y facturas */}
        <div className="da-section">
          <div className="da-section-header">
            <h3 className="da-section-title">Pagos y facturas</h3>
            <span className="da-section-badge">Mayo 2026</span>
          </div>
          <div className="da-section-body">
            <div className="da-table-wrap">
              <table className="da-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Factura</th>
                    <th style={{ width: '26%' }}>Estado</th>
                    <th style={{ width: '26%' }}>Pago</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="da-td-main">{invoice._id?.slice(-8).toUpperCase()}</td>
                      <td>
                        <span className={`da-badge ${invoice.estado === 'PAGADA' ? 'da-badge--green' : 'da-badge--gold'}`}>
                          {invoice.estado || '-'}
                        </span>
                      </td>
                      <td>{invoice.metodoPago || 'PENDIENTE'}</td>
                      <td className="da-td-gold da-td-right">{formatCurrency(invoice.total)}</td>
                    </tr>
                  ))}
                  {!recentPayments.length && (
                    <tr><td colSpan="4" className="da-table-empty">
                      <i className="ti ti-receipt-off" aria-hidden="true" />
                      Sin facturas para mostrar
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
 
        {/* Top de negocio */}
        <div className="da-section">
          <div className="da-section-header">
            <h3 className="da-section-title">Top de negocio</h3>
            <span className="da-section-badge">Este mes</span>
          </div>
          <div className="da-section-body">
            <div className="da-top-grid">
              <div className="da-top-item">
                <div className="da-top-item-label">Restaurante líder</div>
                <div className="da-top-item-val">{topRestaurant?.restaurante || 'Sin datos'}</div>
                <div className="da-top-item-sub">{topRestaurant ? `${topRestaurant.totalPedidos} pedidos · ${topRestaurant.totalReservaciones} reservas` : 'Aún no hay datos suficientes'}</div>
                <div className="da-top-item-amount">{topRestaurant ? formatCurrency(topRestaurant.ingresos) : '$0.00'}</div>
              </div>
              <div className="da-top-item">
                <div className="da-top-item-label">Plato más vendido</div>
                <div className="da-top-item-val">{topDish?.nombre || 'Sin datos'}</div>
                <div className="da-top-item-sub">{topDish ? `${topDish.totalVendidos} vendidos` : 'Aún no hay ventas registradas'}</div>
                <div className="da-top-item-amount">{topDish ? formatCurrency(topDish.ingresos) : '$0.00'}</div>
              </div>
              <div className="da-top-item">
                <div className="da-top-item-label">Hora pico</div>
                <div className="da-top-item-val">{peakHour?.hora !== undefined ? `${String(peakHour.hora).padStart(2, '0')}:00` : 'Sin datos'}</div>
                <div className="da-top-item-sub">{peakHour ? `${peakHour.demandaTotal} eventos combinados` : 'No hay actividad suficiente'}</div>
              </div>
              <div className="da-top-item">
                <div className="da-top-item-label">Usuarios totales</div>
                <div className="da-top-item-val da-top-item-val--gold">{visibleUsers.length}</div>
                <div className="da-top-item-sub">{isScoped ? 'Usuarios vinculados a tu restaurante' : 'Usuarios registrados en el sistema'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* ══ FILA 3: Reservaciones recientes + Clientes + Actividad ══ */}
      <div className="da-grid-3">
 
        {/* Reservaciones recientes */}
        <div className="da-section">
          <div className="da-section-header">
            <h3 className="da-section-title">Reservaciones recientes</h3>
            <span className="da-section-badge">Últimas {recentReservations.length}</span>
          </div>
          <div className="da-section-body">
            {recentReservations.length ? (
              <div className="da-res-list">
                {recentReservations.map((res) => (
                  <div key={res._id} className="da-res-card">
                    <div className="da-res-card-top">
                      <div>
                        <div className="da-res-card-name">{res.clienteNombre}</div>
                        <div className="da-res-card-resto">{res.restaurantID?.name || res.restaurantID?.nombre || '-'}</div>
                      </div>
                      <span className={`da-badge ${res.estado === 'CONFIRMADA' ? 'da-badge--green' : res.estado === 'CANCELADA' ? 'da-badge--red' : 'da-badge--gold'}`}>
                        {res.estado}
                      </span>
                    </div>
                    <div className="da-res-card-time">{formatDate(res.fechaReserva)} · {res.horaInicio} – {res.horaFin}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="da-act-empty">
                <i className="ti ti-calendar-off" aria-hidden="true" />
                Sin reservaciones para mostrar
              </div>
            )}
          </div>
        </div>
 
        {/* Clientes y actividad */}
        <div className="da-section">
          <div className="da-section-header">
            <h3 className="da-section-title">Clientes y actividad</h3>
            <span className="da-section-badge">{recentUsers.length} usuarios</span>
          </div>
          <div className="da-section-body">
            {recentUsers.length ? (
              <div className="da-user-list">
                {recentUsers.map((user) => {
                  const isAdmin = (user.role || '').toString().toUpperCase().includes('ADMIN');
                  return (
                    <div key={user.id || user._id || user.email} className="da-user-item">
                      <div className={`da-user-avatar${isAdmin ? '' : ' da-user-avatar--blue'}`}>
                        {initials(user.username || user.name || 'U')}
                      </div>
                      <div className="da-user-info">
                        <div className="da-user-name">{user.username || user.name || 'Usuario'}</div>
                        <div className="da-user-email">{user.email}</div>
                      </div>
                      <span className={`da-badge ${isAdmin ? 'da-badge--gold' : 'da-badge--blue'}`} style={{ fontSize: 9 }}>
                        {user.role || 'SIN ROL'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="da-act-empty">
                <i className="ti ti-users-off" aria-hidden="true" />
                No hay usuarios cargados
              </div>
            )}
          </div>
        </div>
 
        {/* Actividad en vivo */}
        <div className="da-section">
          <div className="da-section-header">
            <h3 className="da-section-title">Actividad en vivo</h3>
            <span className="da-section-badge da-section-badge--live">
              <span />En vivo
            </span>
          </div>
          <div className="da-section-body">
            {liveActivity.length ? (
              <div className="da-act-list">
                {liveActivity.map((entry, idx) => (
                  <div key={`${entry.at}-${idx}`} className="da-act-item">
                    <div className={`da-act-dot${entry.message.toLowerCase().includes('usuario') ? ' da-act-dot--green' : entry.message.toLowerCase().includes('pdf') ? ' da-act-dot--blue' : ''}`} />
                    <div>
                      <div className="da-act-msg">{entry.message}</div>
                      <div className="da-act-time">{formatDateTime(entry.at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="da-act-empty">
                <i className="ti ti-activity" aria-hidden="true" />
                Esperando actividad en vivo...
              </div>
            )}
          </div>
        </div>
 
      </div>
    </div>
  );
};