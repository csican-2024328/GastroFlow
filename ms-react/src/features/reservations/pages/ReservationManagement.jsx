import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useReservationStore } from '../store/useReservationStore.js';

/* ─── helpers ─────────────────────────────────────────── */
const formatFecha = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d)
    ? '-'
    : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getMesaLabel = (reservation) => {
  const ubicacion = reservation.mesaID?.ubicacion || reservation.mesaID?.identificador || '';
  const numero    = reservation.mesaID?.numero    ?? reservation.mesaID?.number ?? '';
  if (ubicacion && numero) return `${ubicacion} - ${numero}`;
  if (numero)              return `Mesa ${numero}`;
  return '-';
};

/* ─── status config ───────────────────────────────────── */
const STATUS_CONFIG = {
  PENDIENTE:   { label: 'Pendiente',   dot: 'bg-amber-400',  badge: 'bg-amber-50  text-amber-700  border border-amber-200'  },
  CONFIRMADA:  { label: 'Aceptada',    dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  CANCELADA:   { label: 'Rechazada',   dot: 'bg-red-400',    badge: 'bg-red-50    text-red-700    border border-red-200'    },
  COMPLETADA:  { label: 'Completada',  dot: 'bg-blue-400',   badge: 'bg-blue-50   text-blue-700   border border-blue-200'   },
};

const StatusBadge = ({ estado }) => {
  const cfg = STATUS_CONFIG[estado] || STATUS_CONFIG.PENDIENTE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ─── stat card ───────────────────────────────────────── */
const StatCard = ({ icon, count, label, sublabel, iconBg }) => (
  <div className="flex items-center gap-4 bg-white rounded-xl border border-[#E8D4B8] px-6 py-5 shadow-sm flex-1">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-800 leading-tight">{count}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
    </div>
  </div>
);

/* ─── pagination ──────────────────────────────────────── */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E8D4B8] text-gray-500 hover:bg-[#FDFBF7] disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition ${
              p === currentPage
                ? 'bg-[#2D4F4F] text-white'
                : 'border border-[#E8D4B8] text-gray-600 hover:bg-[#FDFBF7]'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-[#E8D4B8] text-gray-500 hover:bg-[#FDFBF7] disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};

/* ─── confirm modal ───────────────────────────────────── */
const ConfirmModal = ({ isOpen, onClose, onConfirm, reservation, loading }) => {
  if (!isOpen || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#FDFBF7] rounded-xl border border-[#E8D4B8] w-full max-w-md shadow-[0_30px_70px_rgba(26,26,26,0.45)]">
        <div className="border-b border-[#E8D4B8] px-6 py-5 bg-[#F5EFEA] rounded-t-xl">
          <h3 className="text-lg font-semibold text-[#2D4F4F]">Confirmar Reservación</h3>
        </div>
        <div className="px-6 py-5 space-y-3">
          <p className="text-gray-600 text-sm">¿Estás seguro de que deseas <span className="font-semibold text-emerald-600">aceptar</span> esta reservación?</p>
          <div className="bg-[#F5EFEA] rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-medium text-gray-800">{reservation.clienteNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha:</span>
              <span className="font-medium text-gray-800">{formatFecha(reservation.fechaReserva)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Horario:</span>
              <span className="font-medium text-gray-800">{reservation.horaInicio} – {reservation.horaFin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mesa:</span>
              <span className="font-medium text-gray-800">{getMesaLabel(reservation)}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-[#E8D4B8] flex justify-end gap-3 px-6 py-4 bg-[#F5EFEA] rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-[#E8D4B8] text-gray-700 bg-[#FDFBF7] hover:bg-[#F5EFEA] transition text-sm font-medium">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-md bg-[#2D4F4F] text-white hover:bg-[#3A6B6B] transition text-sm font-medium disabled:opacity-50 flex items-center gap-2">
            {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── reject modal ────────────────────────────────────── */
const RejectModal = ({ isOpen, onClose, onConfirm, reservation, loading }) => {
  const [reason, setReason] = useState('');
  if (!isOpen || !reservation) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#FDFBF7] rounded-xl border border-[#E8D4B8] w-full max-w-md shadow-[0_30px_70px_rgba(26,26,26,0.45)]">
        <div className="border-b border-[#E8D4B8] px-6 py-5 bg-[#F5EFEA] rounded-t-xl">
          <h3 className="text-lg font-semibold text-red-600">Rechazar Reservación</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-gray-600 text-sm">¿Estás seguro de que deseas <span className="font-semibold text-red-600">rechazar</span> esta reservación?</p>
          <div className="bg-[#F5EFEA] rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-medium text-gray-800">{reservation.clienteNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mesa:</span>
              <span className="font-medium text-gray-800">{getMesaLabel(reservation)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D4F4F] mb-1.5">Motivo del rechazo (opcional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sin disponibilidad, horario no válido, etc."
              rows={3}
              className="w-full rounded-md border border-[#E8D4B8] bg-[#FDFBF7] px-3 py-2.5 text-gray-900 placeholder:text-gray-400 text-sm outline-none focus:border-[#2D4F4F] focus:ring-2 focus:ring-[#2D4F4F]/20 resize-none"
            />
          </div>
        </div>
        <div className="border-t border-[#E8D4B8] flex justify-end gap-3 px-6 py-4 bg-[#F5EFEA] rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-[#E8D4B8] text-gray-700 bg-[#FDFBF7] hover:bg-[#F5EFEA] transition text-sm font-medium">
            Volver
          </button>
          <button onClick={() => onConfirm(reason)} disabled={loading} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition text-sm font-medium disabled:opacity-50 flex items-center gap-2">
            {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const ReservationManagement = () => {
  const {
    reservations,
    loading,
    pagination,
    fetchUserReservations,
    approveOrRejectReservationAction,
  } = useReservationStore();

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal]   = useState({ open: false, reservation: null });
  const [rejectModal, setRejectModal]     = useState({ open: false, reservation: null });
  const [sortOrder, setSortOrder]         = useState('desc'); // 'asc' | 'desc'

  /* fetch on mount and page change */
  useEffect(() => {
    fetchUserReservations(pagination.currentPage, pagination.limit);
  }, [pagination.currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchUserReservations(page, pagination.limit);
  };

  /* stats */
  const aceptadas  = reservations.filter((r) => r.estado === 'CONFIRMADA').length;
  const rechazadas = reservations.filter((r) => r.estado === 'CANCELADA').length;
  const pendientes = reservations.filter((r) => r.estado === 'PENDIENTE').length;

  /* sorted table rows */
  const sortedReservations = [...reservations].sort((a, b) => {
    const da = new Date(a.fechaReserva);
    const db = new Date(b.fechaReserva);
    return sortOrder === 'asc' ? da - db : db - da;
  });

  /* actions */
  const handleConfirm = async () => {
    if (!confirmModal.reservation) return;
    setActionLoading(true);
    const result = await approveOrRejectReservationAction(confirmModal.reservation._id, {
      accion: 'APROBAR',
      clienteEmail: confirmModal.reservation.clienteEmail,
    });
    setActionLoading(false);
    if (result.success) {
      toast.success('Reservación confirmada correctamente');
      setConfirmModal({ open: false, reservation: null });
      fetchUserReservations(pagination.currentPage, pagination.limit);
    } else {
      toast.error(result.error || 'Error al confirmar reservación');
    }
  };

  const handleReject = async (reason) => {
    if (!rejectModal.reservation) return;
    setActionLoading(true);
    const result = await approveOrRejectReservationAction(rejectModal.reservation._id, {
      accion: 'RECHAZAR',
      razon: reason,
      clienteEmail: rejectModal.reservation.clienteEmail,
    });
    setActionLoading(false);
    if (result.success) {
      toast.success('Reservación rechazada');
      setRejectModal({ open: false, reservation: null });
      fetchUserReservations(pagination.currentPage, pagination.limit);
    } else {
      toast.error(result.error || 'Error al rechazar reservación');
    }
  };

  const isActionable = (estado) => estado === 'PENDIENTE';

  return (
    <div className="p-6 min-h-screen bg-[#FDFBF7]">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Administración de Reservaciones</h1>
        <p className="text-gray-500 mt-1 text-sm">Gestiona y actualiza el estado de las reservaciones.</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <StatCard
          iconBg="bg-[#2D4F4F]"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          }
          label="Aceptadas"
          count={aceptadas}
          sublabel="Reservaciones confirmadas"
        />
        <StatCard
          iconBg="bg-[#C9695A]"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
          label="Rechazadas"
          count={rechazadas}
          sublabel="Reservaciones rechazadas"
        />
        <StatCard
          iconBg="bg-[#C4A97A]"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          }
          label="Pendientes"
          count={pendientes}
          sublabel="Reservaciones por confirmar"
        />
      </div>

      {/* ── Table card ── */}
      <div className="bg-[#FDFBF7] rounded-xl border border-[#E8D4B8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-600">
            <thead className="bg-[#F5EFEA] border-b border-[#E8D4B8]">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <button
                    onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                    className="flex items-center gap-1 hover:text-[#2D4F4F] transition"
                  >
                    Fecha
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15M8.25 9L12 5.25 15.75 9" />
                    </svg>
                  </button>
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hora Inicio</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hora Fin</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mesa</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Personas</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</th>
                <th className="px-5 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D4B8]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin w-6 h-6 text-[#2D4F4F]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      <span>Cargando reservaciones...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedReservations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-gray-400">
                    No hay reservaciones disponibles
                  </td>
                </tr>
              ) : (
                sortedReservations.map((reservation, index) => {
                  const actionable = isActionable(reservation.estado);
                  return (
                    <tr key={reservation._id || index} className="hover:bg-[#F5EFEA] transition">
                      <td className="px-5 py-4 font-medium text-gray-700 whitespace-nowrap">
                        {formatFecha(reservation.fechaReserva)}
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        {reservation.horaInicio || '-'}
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        {reservation.horaFin || '-'}
                      </td>
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                        {getMesaLabel(reservation)}
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-center">
                        {reservation.cantidadPersonas ?? '-'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge estado={reservation.estado} />
                      </td>
                      <td className="px-5 py-4 text-gray-500 max-w-[160px] truncate">
                        {reservation.notas || '–'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Accept */}
                          <button
                            onClick={() => setConfirmModal({ open: true, reservation })}
                            disabled={!actionable}
                            title={actionable ? 'Aceptar reservación' : 'No se puede modificar'}
                            className={`w-8 h-8 flex items-center justify-center rounded-md transition ${
                              actionable
                                ? 'bg-[#2D4F4F] text-white hover:bg-[#3A6B6B] shadow-sm'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </button>

                          {/* Reject */}
                          <button
                            onClick={() => setRejectModal({ open: true, reservation })}
                            disabled={!actionable}
                            title={actionable ? 'Rechazar reservación' : 'No se puede modificar'}
                            className={`w-8 h-8 flex items-center justify-center rounded-md transition ${
                              actionable
                                ? 'bg-[#C9695A] text-white hover:bg-red-600 shadow-sm'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer / Pagination ── */}
        <div className="px-5 py-4 border-t border-[#E8D4B8] bg-[#F5EFEA] flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <span>
            Mostrando {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.totalRecords)} a{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} de{' '}
            {pagination.totalRecords} reservaciones
          </span>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      <ConfirmModal
        isOpen={confirmModal.open}
        reservation={confirmModal.reservation}
        loading={actionLoading}
        onClose={() => setConfirmModal({ open: false, reservation: null })}
        onConfirm={handleConfirm}
      />
      <RejectModal
        isOpen={rejectModal.open}
        reservation={rejectModal.reservation}
        loading={actionLoading}
        onClose={() => setRejectModal({ open: false, reservation: null })}
        onConfirm={handleReject}
      />
    </div>
  );
};

export default ReservationManagement;
