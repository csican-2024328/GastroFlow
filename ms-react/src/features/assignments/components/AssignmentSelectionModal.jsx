import { useState } from 'react';
import { Notyf } from 'notyf';

const notyf = new Notyf({
  duration: 3000,
  position: { x: 'right', y: 'top' },
  types: [
    {
      type: 'success',
      background: '#69A77F',
      icon: false,
    },
    {
      type: 'error',
      background: '#D1574F',
      icon: false,
    },
  ],
});

export const AssignmentSelectionModal = ({ 
  isOpen, 
  platformAdmins, 
  restaurants, 
  selectedAdmin, 
  selectedRestaurant, 
  onSelectAdmin, 
  onSelectRestaurant, 
  onConfirm, 
  onCancel,
  loading 
}) => {
  const [searchAdminTerm, setSearchAdminTerm] = useState('');
  const [searchRestaurantTerm, setSearchRestaurantTerm] = useState('');

  if (!isOpen) return null;

  const filteredAdmins = platformAdmins.filter(admin =>
    admin.Name?.toLowerCase().includes(searchAdminTerm.toLowerCase()) ||
    admin.Email?.toLowerCase().includes(searchAdminTerm.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.nombre?.toLowerCase().includes(searchRestaurantTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (!selectedAdmin) {
      notyf.error('Debes seleccionar un administrador');
      return;
    }
    if (!selectedRestaurant) {
      notyf.error('Debes seleccionar un restaurante');
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-serif text-[#2C4035]">Nueva Asignación</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Selecciona un administrador y el restaurante al que deseas asignarlo.
        </p>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8">
          {/* Admin Selection */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F4EFE7] flex items-center justify-center mr-3 text-[#2C4035] font-bold">
                1
              </div>
              <h3 className="text-xl font-serif text-[#2C4035]">Selecciona un Administrador</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Elige el administrador que deseas asignar.</p>

            {/* Search */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Buscar administrador..."
                value={searchAdminTerm}
                onChange={(e) => setSearchAdminTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C87A55]"
              />
            </div>

            {/* Admin List */}
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {filteredAdmins.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay administradores</p>
              ) : (
                filteredAdmins.map((admin) => (
                  <div
                    key={admin.Id}
                    onClick={() => onSelectAdmin(admin)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAdmin?.Id === admin.Id
                        ? 'border-[#2C4035] bg-[#F4EFE7]'
                        : 'border-gray-200 hover:border-[#C87A55]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#2C4035] text-white flex items-center justify-center font-bold text-sm">
                          {admin.Name?.charAt(0)}{admin.Surname?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#2C4035] truncate">
                            {admin.Name} {admin.Surname}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{admin.Email}</p>
                        </div>
                      </div>
                      {selectedAdmin?.Id === admin.Id && (
                        <div className="text-[#2C4035] text-xl">✓</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Restaurant Selection */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F4EFE7] flex items-center justify-center mr-3 text-[#2C4035] font-bold">
                2
              </div>
              <h3 className="text-xl font-serif text-[#2C4035]">Selecciona un Restaurante</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Elige el restaurante al que deseas asignar el administrador.</p>

            {/* Search */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Buscar restaurante..."
                value={searchRestaurantTerm}
                onChange={(e) => setSearchRestaurantTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C87A55]"
              />
            </div>

            {/* Restaurant List */}
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {filteredRestaurants.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay restaurantes</p>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    onClick={() => onSelectRestaurant(restaurant)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRestaurant?._id === restaurant._id
                        ? 'border-[#2C4035] bg-[#F4EFE7]'
                        : 'border-gray-200 hover:border-[#C87A55]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#C87A55] text-white flex items-center justify-center">
                          🏪
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#2C4035] truncate">{restaurant.nombre}</p>
                          <p className="text-sm text-gray-600 truncate">{restaurant.ciudad || 'Sin ubicación'}</p>
                        </div>
                      </div>
                      {selectedRestaurant?._id === restaurant._id && (
                        <div className="text-[#2C4035] text-xl">✓</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {selectedAdmin && selectedRestaurant && (
          <div className="mt-8 p-4 bg-[#F4EFE7] rounded-lg border border-[#E2D4B7]">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Resumen de la Asignación</p>
                <p className="font-semibold text-[#2C4035]">
                  {selectedAdmin.Name} {selectedAdmin.Surname}
                </p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Será administrador de</p>
                <p className="font-semibold text-[#2C4035]">{selectedRestaurant.nombre}</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAdmin || !selectedRestaurant || loading}
            className="px-6 py-2 bg-[#2C4035] text-white rounded-lg hover:bg-[#1A3A3A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : 'Continuar con la Asignación →'}
          </button>
        </div>
      </div>
    </div>
  );
};
