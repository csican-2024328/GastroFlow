// import { AlertCircle } from 'lucide-react';

export const ConfirmationModal = ({ 
  isOpen, 
  admin, 
  restaurant, 
  currentAssignment,
  onConfirm, 
  onCancel,
  loading 
}) => {
  if (!isOpen) return null;

  const adminFullName = `${admin?.Name || ''} ${admin?.Surname || ''}`.trim();
  const restaurantName = restaurant?.nombre || '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl text-center">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#FFF5E6] flex items-center justify-center">
            <span className="text-3xl text-[#C87A55]">⚠️</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-serif text-[#2C4035] mb-6">
          ¿Estás seguro de asignar a<br />
          <span className="text-[#C87A55]">{adminFullName}</span>
          <br />
          como administrador de<br />
          <span className="text-[#C87A55]">{restaurantName}</span>?
        </h2>

        {/* Current Assignment Info */}
        {currentAssignment && (
          <div className="mb-6 p-4 bg-[#FFF5E6] rounded-lg border border-[#E2D4B7]">
            <p className="text-sm text-gray-700">
              <strong>⚠️ Nota:</strong> Este administrador ya tenía asignado el restaurante{' '}
              <strong>{currentAssignment.nombre || currentAssignment}</strong>. 
              Esta acción reemplazará la asignación anterior.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mb-6 text-left space-y-3">
          <div className="p-3 bg-[#F4EFE7] rounded-lg">
            <p className="text-sm text-gray-600">Administrador:</p>
            <p className="font-semibold text-[#2C4035]">{adminFullName}</p>
            {admin?.Email && <p className="text-xs text-gray-500">{admin.Email}</p>}
          </div>
          <div className="p-3 bg-[#F4EFE7] rounded-lg">
            <p className="text-sm text-gray-600">Restaurante:</p>
            <p className="font-semibold text-[#2C4035]">{restaurantName}</p>
            {restaurant?.ciudad && <p className="text-xs text-gray-500">{restaurant.ciudad}</p>}
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-8">
          Solo los administradores de plataforma pueden asignar restaurantes a otros administradores.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#C87A55] text-white rounded-lg hover:bg-[#B5653A] transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? '⏳ Asignando...' : '✓ Sí, asignar'}
          </button>
        </div>
      </div>
    </div>
  );
};
