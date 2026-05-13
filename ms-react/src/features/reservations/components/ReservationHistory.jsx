import { useState } from 'react';
import toast from 'react-hot-toast';
import { useReservationStore } from '../store/useReservationStore.js';

export const ReservationHistory = ({ reservations, onCancel, isLoading }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredReservations =
    filterStatus === 'all'
      ? reservations
      : reservations.filter((r) => r.estado?.toLowerCase() === filterStatus.toLowerCase());

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMADA':
        return {
          bg: 'bg-[#2C4035]',
          text: 'text-white',
          label: 'Confirmada',
          icon: '✓',
        };
      case 'CANCELADA':
        return {
          bg: 'bg-[#5A5146]',
          text: 'text-white',
          label: 'Cancelada',
          icon: '✗',
        };
      case 'COMPLETADA':
        return {
          bg: 'bg-[#2C4035]',
          text: 'text-white',
          label: 'Completada',
          icon: '✓',
        };
      default:
        return {
          bg: 'bg-[#C49A2B]',
          text: 'text-white',
          label: 'Pendiente',
          icon: '⏱',
        };
    }
  };

  const getTimeStatus = (reservationDate, reservationTime) => {
    const now = new Date();
    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);

    if (reservationDateTime < now) {
      return 'passed';
    } else if (reservationDateTime.getTime() - now.getTime() < 60 * 60 * 1000) {
      return 'soon';
    }
    return 'upcoming';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No especificada';
    return timeString.slice(0, 5).replace(':', 'h');
  };

  const handleCancelReservation = async (reservationId) => {
    if (
      window.confirm(
        '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.'
      )
    ) {
      await onCancel(reservationId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'confirmada', label: 'Confirmadas' },
          { value: 'completada', label: 'Completadas' },
          { value: 'cancelada', label: 'Canceladas' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              filterStatus === filter.value
                ? 'bg-[#C49A2B] text-white'
                : 'border border-[#E2D4B7] bg-white text-[#5A5146] hover:border-[#C49A2B]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Lista de reservas */}
      {filteredReservations.length === 0 ? (
        <div className="rounded-2xl border border-[#E2D4B7] bg-white p-10 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold text-[#1A1A1A]">No hay reservas</p>
          <p className="text-sm text-[#5A5146] mt-2">
            {filterStatus === 'all'
              ? 'Aún no tienes reservas. ¡Haz tu primera reserva!'
              : `No tienes reservas ${filterStatus}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((reservation) => {
            const statusBadge = getStatusBadge(reservation.estado);
            const timeStatus = getTimeStatus(reservation.fecha, reservation.horaInicio);
            const isExpanded = expandedId === reservation._id;

            return (
              <div
                key={reservation._id}
                className={`rounded-2xl border transition ${
                  isExpanded ? 'border-[#C49A2B] bg-white shadow-lg' : 'border-[#E2D4B7] bg-white'
                }`}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : reservation._id)}
                  className="w-full px-6 py-4 text-left hover:bg-[#F8F5F0]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold text-[#1A1A1A]">
                            {reservation.restaurante?.nombre || 'Restaurante'}
                          </h4>
                          <p className="text-sm text-[#5A5146]">
                            📅 {formatDate(reservation.fecha)} • {formatTime(reservation.horaInicio)} -{' '}
                            {formatTime(reservation.horaFin)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          {statusBadge.icon} {statusBadge.label}
                        </span>
                        {timeStatus === 'soon' && (
                          <span className="inline-flex items-center rounded-full bg-[#C87A55] px-3 py-1 text-xs font-semibold text-white">
                            ⏰ Próximamente
                          </span>
                        )}
                        <span className="text-xs text-[#5A5146]">👥 {reservation.personas} personas</span>
                      </div>
                    </div>

                    <div className="text-2xl ml-2">{isExpanded ? '▼' : '▶'}</div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-[#E2D4B7] px-6 py-4 space-y-4">
                    {/* Detalles */}
                    <div className="space-y-2 bg-[#F8F5F0] rounded-lg p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5A5146]">🔔 Número de reserva:</span>
                        <span className="font-mono font-semibold text-[#1A1A1A]">
                          {reservation._id?.substring(reservation._id.length - 8).toUpperCase() || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5A5146]">🪑 Mesa asignada:</span>
                        <span className="font-semibold text-[#1A1A1A]">
                          {reservation.mesa?.numero || 'Por asignar'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5A5146]">📍 Ubicación:</span>
                        <span className="font-semibold text-[#1A1A1A]">
                          {reservation.mesa?.ubicacion || 'No especificada'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#5A5146]">📅 Creada:</span>
                        <span className="font-semibold text-[#1A1A1A]">
                          {new Date(reservation.creadaEn).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {/* Notas */}
                    {reservation.notas && (
                      <div className="rounded-lg border border-[#C49A2B] bg-[#FFF8E7] p-4">
                        <p className="text-sm text-[#3D2C1E]">
                          <strong>📝 Notas:</strong> {reservation.notas}
                        </p>
                      </div>
                    )}

                    {/* Razón de cancelación */}
                    {reservation.estado?.toUpperCase() === 'CANCELADA' && reservation.razonCancelacion && (
                      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                        <p className="text-sm text-red-700">
                          <strong>❌ Razón de cancelación:</strong> {reservation.razonCancelacion}
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 pt-4 border-t border-[#E2D4B7]">
                      {reservation.estado?.toUpperCase() === 'CONFIRMADA' &&
                        getTimeStatus(reservation.fecha, reservation.horaInicio) !== 'passed' && (
                          <button
                            onClick={() => handleCancelReservation(reservation._id)}
                            disabled={isLoading}
                            className="flex-1 rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancelar Reserva
                          </button>
                        )}
                      {reservation.estado?.toUpperCase() === 'COMPLETADA' && (
                        <button className="flex-1 rounded-lg border border-[#2C4035] bg-white px-4 py-2 text-sm font-semibold text-[#2C4035] transition hover:bg-[#E2D4B7]">
                          ⭐ Dejar Reseña
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(null)}
                        className="flex-1 rounded-lg border border-[#C87A55] bg-white px-4 py-2 text-sm font-semibold text-[#C87A55] transition hover:bg-[#E2D4B7]"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
