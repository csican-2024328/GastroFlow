import { useEffect } from 'react';
import { useOrderCartStore } from '../store/useOrderCartStore.js';
import { StepperOrderFlow } from './StepperOrderFlow.jsx';
import { StepSelectTable } from './steps/StepSelectTable.jsx';
import { StepBuildCart } from './steps/StepBuildCart.jsx';
import { StepConfirmOrder } from './steps/StepConfirmOrder.jsx';
 
export const OrderFlowModal = ({ isOpen, onClose, restaurantId }) => {
  const currentStep   = useOrderCartStore((s) => s.currentStep);
  const setRestaurant = useOrderCartStore((s) => s.setRestaurant);
  const resetCart     = useOrderCartStore((s) => s.resetCart);
 
  /* ── Effect — INTACTO ── */
  useEffect(() => {
    if (restaurantId) setRestaurant(restaurantId);
  }, [restaurantId, setRestaurant]);
 
  const handleClose = () => { resetCart(); onClose(); };
 
  if (!isOpen) return null;
 
  return (
    <div className="oflow-overlay">
      <div className="oflow-modal">
 
        {/* Header */}
        <div className="oflow-header">
          <div className="oflow-header-left">
            <h2 className="oflow-header-title">Hacer Pedido</h2>
            <p className="oflow-header-step">Paso {currentStep} de 3</p>
          </div>
          <button onClick={handleClose} className="oflow-close" aria-label="Cerrar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
 
        {/* Body */}
        <div className="oflow-body">
          <StepperOrderFlow />
 
          <div style={{ marginTop: 20 }}>
            {currentStep === 1 && <StepSelectTable onClose={handleClose} />}
            {currentStep === 2 && <StepBuildCart />}
            {currentStep === 3 && <StepConfirmOrder onClose={handleClose} />}
          </div>
        </div>
 
      </div>
    </div>
  );
};