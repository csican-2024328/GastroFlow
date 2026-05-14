import { useEffect } from 'react';

export const ReservationConfirmation = ({ reservation, restaurant, onClose }) => {
  useEffect(() => {
    // Auto-close después de 5 segundos
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5).replace(':', 'h');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div className="w-full max-w-md rounded-2xl bg-[#FDFBF7] border border-[#E8D4B8] p-8 shadow-2xl animate-in fade-in zoom-in">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2D4F4F]">
            <span className="text-3xl">✓</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center font-['Playfair_Display'] text-2xl font-bold text-gray-800">
          {reservation?.estado === 'PENDIENTE' ? '⏳ Reservación Recibida' : '¡Reserva Confirmada!'}
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          {reservation?.estado === 'PENDIENTE' 
            ? 'Tu reservación está siendo observada por un administrador. Recibirás un email de confirmación pronto.'
            : 'Tu reserva ha sido registrada exitosamente'}
        </p>

        {/* Resumen */}
        <div className="mb-6 space-y-3 rounded-lg bg-[#F5EFEA] border border-[#E8D4B8] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Restaurante</p>
            <p className="font-semibold text-gray-800">{restaurant?.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B59070]">Fecha</p>
              <p className="font-semibold text-[#1A1A1A] text-sm">
                {formatDate(reservation.date || reservation.fecha)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B59070]">Hora</p>
              <p className="font-semibold text-[#1A1A1A] text-sm">
                {formatTime(reservation.timeStart || reservation.horaInicio)} -{' '}
                {formatTime(reservation.timeEnd || reservation.horaFin)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B59070]">Personas</p>
              <p className="font-semibold text-[#1A1A1A]">{reservation.partySize || reservation.personas}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B59070]">Mesa</p>
              <p className="font-semibold text-[#1A1A1A]">
                Mesa {reservation.tableId?.numero || reservation.mesa?.numero}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8D4B8]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#B59070]">
              Número de Reserva
            </p>
            <p className="font-mono font-bold text-[#C49A2B] text-lg">
              {reservation._id?.substring(reservation._id.length - 8).toUpperCase() ||
                reservation.confirmationCode ||
                'RES-' + new Date().getTime()}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className={`mb-6 rounded-lg border p-4 ${
          reservation?.estado === 'PENDIENTE' 
            ? 'border-amber-400 bg-amber-50' 
            : 'border-[#C49A2B] bg-[#FFF8E7]'
        }`}>
          <p className={`text-sm ${reservation?.estado === 'PENDIENTE' ? 'text-amber-900' : 'text-[#3D2C1E]'}`}>
            {reservation?.estado === 'PENDIENTE' ? (
              <>⏳ <strong>Tu reservación está bajo observación:</strong> Un administrador del restaurante la revisará en los próximos 15 minutos a 2 horas. Recibirás un email de confirmación cuando sea aprobada. NO confirmes tu asistencia hasta recibir ese email.</>
            ) : (
              <>📍 <strong>Importante:</strong> Por favor, llega con 15 minutos de anticipación. Tu reserva se mantendrá por 30 minutos después de la hora de inicio.</>
            )}
          </p>
        </div>

        {/* Email notification */}
        <div className="mb-6 rounded-lg bg-[#FDFBF7] border border-[#E8D4B8] p-4 text-center">
          <p className="text-sm text-[#5A5146]">
            {reservation?.estado === 'PENDIENTE' 
              ? '📧 Te hemos enviado un correo notificándote que tu reservación está siendo observada'
              : '✉️ Se ha enviado un correo de confirmación a tu email'}
          </p>
        </div>

        {/* Buttons */}
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-gradient-to-r from-[#2C4035] to-[#1A1A1A] px-6 py-3 font-semibold text-white transition hover:shadow-lg"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
