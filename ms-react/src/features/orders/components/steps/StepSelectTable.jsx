import { useEffect, useState } from 'react';
import { useOrderCartStore } from '../../store/useOrderCartStore.js';
import { useTableStore } from '../../../tables/store/useTableStore.js';
import { notyfError } from '../../../../shared/utils/notyf.js';

export const StepSelectTable = ({ onClose }) => {
  const restaurantId = useOrderCartStore((s) => s.restaurantId);
  const orderType = useOrderCartStore((s) => s.orderType);
  const selectedMesa = useOrderCartStore((s) => s.selectedMesa);
  const setSelectedMesa = useOrderCartStore((s) => s.setSelectedMesa);
  const setCurrentStep = useOrderCartStore((s) => s.setCurrentStep);
  const setOrderType = useOrderCartStore((s) => s.setOrderType);

  const mesas = useTableStore((s) => s.mesas);
  const loading = useTableStore((s) => s.loading);
  const fetchMesas = useTableStore((s) => s.fetchMesas);

  const [selectedType, setSelectedType] = useState(orderType);

  useEffect(() => {
    if (restaurantId) {
      fetchMesas(1, 100, restaurantId);
    }
  }, [restaurantId, fetchMesas]);

  const handleSelectMesa = (mesa) => {
    setSelectedMesa(mesa);
  };

  const handleNext = () => {
    if (selectedType === 'EN_MESA' && !selectedMesa) {
      notyfError('Por favor selecciona una mesa');
      return;
    }

    setOrderType(selectedType);
    setCurrentStep(2);
  };

  // Filter available mesas for EN_MESA orders
  const availableMesas =
    selectedType === 'EN_MESA' ? mesas.filter((m) => m.isActive) : [];

  return (
    <div className="space-y-6">
      {/* Order Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Tipo de Pedido</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'EN_MESA', label: '🪑 En Mesa', desc: 'Comer aquí' },
            { value: 'A_DOMICILIO', label: '🚗 A Domicilio', desc: 'Envío a casa' },
            { value: 'PARA_LLEVAR', label: '📦 Para Llevar', desc: 'Retiro' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${
                  selectedType === type.value
                    ? 'border-[#D4984E] bg-[#FFF8F0]'
                    : 'border-[#E2D4B7] bg-white hover:border-[#D4984E]'
                }
              `}
            >
              <div className="text-2xl mb-2">{type.label.split(' ')[0]}</div>
              <div className="font-semibold text-[#1A1A1A]">{type.label.split(' ').slice(1).join(' ')}</div>
              <div className="text-xs text-[#4b4b4b]">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Table Selection - Only for EN_MESA */}
      {selectedType === 'EN_MESA' && (
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Selecciona tu Mesa
          </h3>
          {loading ? (
            <div className="text-center py-8 text-[#4b4b4b]">Cargando mesas...</div>
          ) : availableMesas.length === 0 ? (
            <div className="text-center py-8 text-[#D4984E] font-semibold">
              No hay mesas disponibles en este momento
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableMesas.map((mesa) => (
                <button
                  key={mesa._id}
                  onClick={() => handleSelectMesa(mesa)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-center
                    ${
                      selectedMesa?._id === mesa._id
                        ? 'border-[#D4984E] bg-[#FFF8F0] shadow-md'
                        : 'border-[#E2D4B7] bg-white hover:border-[#D4984E]'
                    }
                  `}
                >
                  <div className="text-3xl mb-2">🪑</div>
                  <div className="font-bold text-[#1A1A1A]">Mesa {mesa.numero}</div>
                  <div className="text-xs text-[#4b4b4b] mt-1">
                    {mesa.capacidad} {mesa.capacidad === 1 ? 'persona' : 'personas'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delivery Address - Only for A_DOMICILIO */}
      {selectedType === 'A_DOMICILIO' && (
        <div className="bg-[#FFF8F0] border border-[#E2D4B7] rounded-lg p-4">
          <p className="text-[#4b4b4b] text-sm">
            📍 Proporciona tu dirección en el siguiente paso
          </p>
        </div>
      )}

      {/* Scheduled Time - Only for PARA_LLEVAR */}
      {selectedType === 'PARA_LLEVAR' && (
        <div className="bg-[#FFF8F0] border border-[#E2D4B7] rounded-lg p-4">
          <p className="text-[#4b4b4b] text-sm">
            ⏰ Selecciona la hora de retiro en el siguiente paso
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-[#d8c8a6] text-[#1A1A1A] rounded-lg hover:bg-[#F8F5F0] transition-colors font-semibold"
        >
          Cancelar
        </button>
        <button
          onClick={handleNext}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D4984E] to-[#B8860B] text-white rounded-lg hover:from-[#C2852D] hover:to-[#A67C09] transition-all font-semibold shadow-md hover:shadow-lg"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};
