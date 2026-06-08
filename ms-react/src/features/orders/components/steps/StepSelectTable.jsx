import { useEffect, useState } from 'react';
import { useOrderCartStore } from '../../store/useOrderCartStore.js';
import { useTableStore } from '../../../tables/store/useTableStore.js';
import { notyfError } from '../../../../shared/utils/notyf.js';
 
export const StepSelectTable = ({ onClose }) => {
  const restaurantId   = useOrderCartStore((s) => s.restaurantId);
  const orderType      = useOrderCartStore((s) => s.orderType);
  const selectedMesa   = useOrderCartStore((s) => s.selectedMesa);
  const setSelectedMesa= useOrderCartStore((s) => s.setSelectedMesa);
  const setCurrentStep = useOrderCartStore((s) => s.setCurrentStep);
  const setOrderType   = useOrderCartStore((s) => s.setOrderType);
 
  const mesas      = useTableStore((s) => s.mesas);
  const loading    = useTableStore((s) => s.loading);
  const fetchMesas = useTableStore((s) => s.fetchMesas);
 
  const [selectedType, setSelectedType] = useState(orderType);
 
  useEffect(() => {
    if (restaurantId) fetchMesas(1, 100, restaurantId);
  }, [restaurantId, fetchMesas]);
 
  const handleNext = () => {
    if (selectedType === 'EN_MESA' && !selectedMesa) { notyfError('Por favor selecciona una mesa'); return; }
    setOrderType(selectedType);
    setCurrentStep(2);
  };
 
  const availableMesas = selectedType === 'EN_MESA' ? mesas.filter(m => m.isActive) : [];
 
  return (
    <div>
      {/* Tipo de pedido */}
      <h3 style={{ fontSize:13, fontWeight:500, color:'var(--or-text-primary)', marginBottom:12 }}>Tipo de Pedido</h3>
      <div className="or-type-grid">
        {[
          { value:'EN_MESA',     label:'En Mesa',    icon:'🪑', desc:'Comer aquí' },
          { value:'A_DOMICILIO', label:'A Domicilio', icon:'🚗', desc:'Envío a casa' },
          { value:'PARA_LLEVAR', label:'Para Llevar', icon:'📦', desc:'Retiro' },
        ].map(type => (
          <button key={type.value} onClick={() => setSelectedType(type.value)} className={`or-type-btn${selectedType===type.value?' selected':''}`}>
            <div className="or-type-icon">{type.icon}</div>
            <div className="or-type-label">{type.label}</div>
            <div className="or-type-desc">{type.desc}</div>
          </button>
        ))}
      </div>
 
      {/* Mesas */}
      {selectedType === 'EN_MESA' && (
        <div style={{ marginTop:18 }}>
          <h3 style={{ fontSize:13, fontWeight:500, color:'var(--or-text-primary)', marginBottom:12 }}>Selecciona tu Mesa</h3>
          {loading ? (
            <div className="cl-loading-text"><div className="or-table-spinner" />Cargando mesas...</div>
          ) : availableMesas.length === 0 ? (
            <div className="or-info-box"><i className="ti ti-info-circle" aria-hidden="true" />No hay mesas disponibles en este momento</div>
          ) : (
            <div className="or-mesa-grid">
              {availableMesas.map(mesa => (
                <button key={mesa._id} onClick={() => setSelectedMesa(mesa)} className={`or-mesa-btn${selectedMesa?._id===mesa._id?' selected':''}`}>
                  <div className="or-mesa-icon">🪑</div>
                  <div className="or-mesa-num">Mesa {mesa.numero}</div>
                  <div className="or-mesa-cap">{mesa.capacidad} {mesa.capacidad===1?'persona':'personas'}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
 
      {selectedType === 'A_DOMICILIO' && (
        <div style={{ marginTop:14 }}>
          <div className="or-info-box"><i className="ti ti-map-pin" aria-hidden="true" />Proporciona tu dirección en el siguiente paso</div>
        </div>
      )}
      {selectedType === 'PARA_LLEVAR' && (
        <div style={{ marginTop:14 }}>
          <div className="or-info-box"><i className="ti ti-clock" aria-hidden="true" />Selecciona la hora de retiro en el siguiente paso</div>
        </div>
      )}
 
      {/* Nav */}
      <div className="or-step-nav">
        <button onClick={onClose} className="or-step-nav-btn or-step-nav-back">Cancelar</button>
        <button onClick={handleNext} className="or-step-nav-btn or-step-nav-next">Siguiente →</button>
      </div>
    </div>
  );
};
 