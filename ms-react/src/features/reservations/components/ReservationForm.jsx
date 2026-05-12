import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const ReservationForm = ({ restaurant, onSubmit, isLoading, availableTables }) => {
  const [formData, setFormData] = useState({
    date: '',
    timeStart: '',
    timeEnd: '',
    partySize: 2,
    notes: '',
    tablePreference: null,
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Datos basicos, 2: Seleccionar mesa, 3: Confirmacion
  const [selectedTable, setSelectedTable] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handlePartySizeChange = (delta) => {
    setFormData((prev) => ({
      ...prev,
      partySize: Math.max(1, Math.min(20, prev.partySize + delta)),
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.timeStart) newErrors.timeStart = 'La hora de inicio es requerida';
    if (!formData.timeEnd) newErrors.timeEnd = 'La hora de fin es requerida';
    if (formData.timeStart >= formData.timeEnd) {
      newErrors.timeEnd = 'La hora de fin debe ser mayor que la hora de inicio';
    }
    if (formData.partySize < 1) newErrors.partySize = 'Debe haber al menos 1 persona';

    // Check if date is in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = 'La fecha debe ser en el futuro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleStep2Submit = () => {
    if (!selectedTable) {
      toast.error('Por favor selecciona una mesa');
      return;
    }
    setStep(3);
  };

  const handleConfirm = async () => {
    const reservationData = {
      restaurantId: restaurant._id,
      date: formData.date,
      timeStart: formData.timeStart,
      timeEnd: formData.timeEnd,
      partySize: formData.partySize,
      tableId: selectedTable._id,
      notes: formData.notes || null,
    };

    await onSubmit(reservationData);
  };

  const getMinTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTime = (time) => {
    return time.replace(':', 'h');
  };

  // STEP 1: Formulario básico
  if (step === 1) {
    return (
      <div className="space-y-6 rounded-2xl border border-[#E2D4B7] bg-white p-6">
        <div>
          <h3 className="mb-1 font-['Playfair_Display'] text-xl font-bold text-[#1A1A1A]">
            Detalles de la Reserva
          </h3>
          <p className="text-sm text-[#5A5146]">Paso 1 de 3</p>
        </div>

        <form onSubmit={handleStep1Submit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              📅 Fecha de la reserva
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-[#E2D4B7] bg-[#F8F5F0] px-4 py-2 text-[#1A1A1A] focus:border-[#C49A2B] focus:outline-none"
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                🕐 Hora de inicio
              </label>
              <input
                type="time"
                name="timeStart"
                value={formData.timeStart}
                onChange={handleInputChange}
                min={getMinTime()}
                className="w-full rounded-lg border border-[#E2D4B7] bg-[#F8F5F0] px-4 py-2 text-[#1A1A1A] focus:border-[#C49A2B] focus:outline-none"
              />
              {errors.timeStart && <p className="mt-1 text-sm text-red-600">{errors.timeStart}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                🕐 Hora de fin
              </label>
              <input
                type="time"
                name="timeEnd"
                value={formData.timeEnd}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-[#E2D4B7] bg-[#F8F5F0] px-4 py-2 text-[#1A1A1A] focus:border-[#C49A2B] focus:outline-none"
              />
              {errors.timeEnd && <p className="mt-1 text-sm text-red-600">{errors.timeEnd}</p>}
            </div>
          </div>

          {/* Party Size */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              👥 Número de personas
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handlePartySizeChange(-1)}
                className="rounded-lg border border-[#E2D4B7] bg-[#F8F5F0] px-4 py-2 text-lg font-bold text-[#C87A55] hover:bg-[#E2D4B7]"
              >
                −
              </button>
              <input
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="w-20 rounded-lg border border-[#E2D4B7] bg-[#F8F5F0] px-4 py-2 text-center text-lg font-bold text-[#1A1A1A] focus:border-[#C49A2B] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handlePartySizeChange(1)}
                className="rounded-lg border border-[#E2D4B7] bg-[#F8F5F0] px-4 py-2 text-lg font-bold text-[#C87A55] hover:bg-[#E2D4B7]"
              >
                +
              </button>
            </div>
            {errors.partySize && <p className="mt-1 text-sm text-red-600">{errors.partySize}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
              📝 Notas especiales (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Cumpleaños, preferencias dietéticas, etc."
              rows="3"
              className="w-full rounded-lg border border-[#E2D4B7] bg-[#F8F5F0] px-4 py-2 text-[#1A1A1A] placeholder:text-[#B59070] focus:border-[#C49A2B] focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-[#C87A55] to-[#C49A2B] px-6 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Siguiente: Seleccionar Mesa'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // STEP 2: Seleccionar mesa
  if (step === 2) {
    return (
      <div className="space-y-6 rounded-2xl border border-[#E2D4B7] bg-white p-6">
        <div>
          <h3 className="mb-1 font-['Playfair_Display'] text-xl font-bold text-[#1A1A1A]">
            Seleccionar Mesa
          </h3>
          <p className="text-sm text-[#5A5146]">
            Paso 2 de 3 - {formData.date} {formatTime(formData.timeStart)} a {formatTime(formData.timeEnd)}
          </p>
        </div>

        {availableTables.length === 0 ? (
          <div className="rounded-lg border border-[#E2D4B7] bg-[#F8F5F0] p-8 text-center">
            <div className="text-4xl mb-3">😔</div>
            <p className="font-semibold text-[#1A1A1A]">No hay mesas disponibles</p>
            <p className="text-sm text-[#5A5146] mt-2">
              Para esta fecha y horario no hay mesas disponibles. Por favor, elige otro horario.
            </p>
            <button
              onClick={() => {
                setStep(1);
                setSelectedTable(null);
              }}
              className="mt-4 rounded-lg border border-[#2C4035] bg-white px-6 py-2 font-semibold text-[#2C4035] hover:bg-[#E2D4B7]"
            >
              ← Cambiar fecha/hora
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {availableTables.map((table) => (
                <button
                  key={table._id}
                  onClick={() => handleTableSelect(table)}
                  className={`rounded-lg border-2 p-4 text-center transition ${
                    selectedTable?._id === table._id
                      ? 'border-[#C49A2B] bg-[#FFF8E7]'
                      : 'border-[#E2D4B7] bg-[#F8F5F0] hover:border-[#C87A55]'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {table.capacity <= 2 ? '🪑' : table.capacity <= 4 ? '🪑🪑' : '🪑🪑🪑'}
                  </div>
                  <div className="font-semibold text-[#1A1A1A]">Mesa {table.numero}</div>
                  <div className="text-sm text-[#5A5146]">{table.capacity} personas</div>
                  {table.ubicacion && (
                    <div className="text-xs text-[#B59070] mt-1">{table.ubicacion}</div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedTable(null);
                }}
                className="flex-1 rounded-lg border border-[#C87A55] bg-white px-6 py-3 font-semibold text-[#C87A55] transition hover:bg-[#E2D4B7]"
              >
                ← Atrás
              </button>
              <button
                onClick={handleStep2Submit}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#C87A55] to-[#C49A2B] px-6 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'Cargando...' : 'Siguiente: Confirmar'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // STEP 3: Confirmación
  if (step === 3) {
    return (
      <div className="space-y-6 rounded-2xl border border-[#E2D4B7] bg-white p-6">
        <div>
          <h3 className="mb-1 font-['Playfair_Display'] text-xl font-bold text-[#1A1A1A]">
            Confirmar Reserva
          </h3>
          <p className="text-sm text-[#5A5146]">Paso 3 de 3 - Revisa los detalles</p>
        </div>

        {/* Resumen */}
        <div className="space-y-3 rounded-lg bg-[#F8F5F0] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#5A5146]">📅 Fecha:</span>
            <span className="font-semibold text-[#1A1A1A]">
              {new Date(formData.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#5A5146]">🕐 Horario:</span>
            <span className="font-semibold text-[#1A1A1A]">
              {formatTime(formData.timeStart)} a {formatTime(formData.timeEnd)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#5A5146]">👥 Personas:</span>
            <span className="font-semibold text-[#1A1A1A]">{formData.partySize} {formData.partySize === 1 ? 'persona' : 'personas'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#5A5146]">🪑 Mesa:</span>
            <span className="font-semibold text-[#1A1A1A]">
              Mesa {selectedTable.numero} ({selectedTable.capacity} lugares)
            </span>
          </div>

          {formData.notes && (
            <div className="flex items-start justify-between border-t border-[#E2D4B7] pt-3">
              <span className="text-[#5A5146]">📝 Notas:</span>
              <span className="font-semibold text-[#1A1A1A] text-right max-w-xs">{formData.notes}</span>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-[#C49A2B] bg-[#FFF8E7] p-4 text-sm">
          <p className="text-[#3D2C1E]">
            ⚠️ <strong>Importante:</strong> La reserva se mantendrá por {selectedTable.capacity > 4 ? '2 horas' : '1.5 horas'} después de la hora de inicio. 
            Por favor, arriba con 15 minutos de anticipación.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setStep(2)}
            className="flex-1 rounded-lg border border-[#C87A55] bg-white px-6 py-3 font-semibold text-[#C87A55] transition hover:bg-[#E2D4B7]"
          >
            ← Cambiar Mesa
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-gradient-to-r from-[#2C4035] to-[#1A1A1A] px-6 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : '✓ Confirmar Reserva'}
          </button>
        </div>
      </div>
    );
  }
};
