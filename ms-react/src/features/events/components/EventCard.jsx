import { useState } from 'react';
import toast from 'react-hot-toast';
import { useEventStore } from '../store/useEventStore.js';

export const EventCard = ({ event, onEventUsed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const useEventAction = useEventStore((s) => s.useEventAction);

  // Determine event status
  const isActive = event.estado === 'ACTIVO';
  const isUpcoming = event.estado === 'PRÓXIMO';
  const hasBeenUsed = event.usado === true;

  // Format dates
  const formatDate = (date) => {
    if (!date) return 'No especificada';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle use event
  const handleUseEvent = async () => {
    setIsLoading(true);
    const result = await useEventAction(event._id);
    setIsLoading(false);

    if (result.success) {
      toast.success('¡Evento utilizado correctamente!');
      if (onEventUsed) onEventUsed(event._id);
    } else {
      toast.error(result.error || 'Error al usar el evento');
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_24px_rgba(61,44,30,0.10)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(61,44,30,0.14)]">
      {/* Image container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-[#FAF9F6]">
        {event.imagen && event.imagen !== '' ? (
          <img
            src={event.imagen}
            alt={event.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#E8956B] to-[#C49A2B] text-5xl">
            🎉
          </div>
        )}

        {/* Status badge */}
        <div className="absolute right-3 top-3">
          {isActive && (
            <span className="inline-flex items-center rounded-full bg-[#2D4F4F] px-3 py-1 text-xs font-semibold text-white">
              ✓ Activo
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center rounded-full bg-[#C49A2B] px-3 py-1 text-xs font-semibold text-white">
              ⏰ Próximamente
            </span>
          )}
          {hasBeenUsed && (
            <span className="inline-flex items-center rounded-full bg-[#5A5146] px-3 py-1 text-xs font-semibold text-white">
              ✓ Utilizado
            </span>
          )}
        </div>
      </div>

      {/* Content container */}
      <div className="flex flex-col p-4">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-['Playfair_Display'] text-lg font-bold text-gray-800">
          {event.nombre}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {event.descripcion || 'Sin descripción disponible'}
        </p>

        {/* Dates */}
        <div className="mb-4 space-y-1 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-[#E8956B]">📅</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">Inicio:</div>
              <div>{formatDate(event.fechaInicio)}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-[#E8956B]">📅</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">Fin:</div>
              <div>{formatDate(event.fechaFin)}</div>
            </div>
          </div>
        </div>

        {/* Action button */}
        {(isActive || isUpcoming) && !hasBeenUsed && (
          <button
            onClick={handleUseEvent}
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-[#E8956B] to-[#C49A2B] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'Usar evento'}
          </button>
        )}

        {hasBeenUsed && (
          <div className="w-full rounded-lg bg-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-800">
            Evento ya utilizado
          </div>
        )}
      </div>
    </div>
  );
};
