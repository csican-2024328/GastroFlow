import { useState, useEffect } from 'react';
import { useOrderCartStore } from '../store/useOrderCartStore.js';
import { useOrderStore } from '../store/useOrderStore.js';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore.js';
import { StepperOrderFlow } from './StepperOrderFlow.jsx';
import { StepSelectTable } from './steps/StepSelectTable.jsx';
import { StepBuildCart } from './steps/StepBuildCart.jsx';
import { StepConfirmOrder } from './steps/StepConfirmOrder.jsx';

export const OrderFlowModal = ({ isOpen, onClose, restaurantId }) => {
  const currentStep = useOrderCartStore((s) => s.currentStep);
  const setRestaurant = useOrderCartStore((s) => s.setRestaurant);
  const resetCart = useOrderCartStore((s) => s.resetCart);

  useEffect(() => {
    if (restaurantId) {
      setRestaurant(restaurantId);
    }
  }, [restaurantId, setRestaurant]);

  const handleClose = () => {
    resetCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#E2D4B7] to-[#D4C4A3] p-6 border-b border-[#d8c8a6]">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Hacer Pedido</h2>
            <button
              onClick={handleClose}
              className="text-[#4b4b4b] hover:text-[#1A1A1A] text-2xl font-light"
            >
              ✕
            </button>
          </div>
          <p className="text-[#4b4b4b] text-sm mt-1">Paso {currentStep} de 3</p>
        </div>

        {/* Stepper */}
        <div className="p-6">
          <StepperOrderFlow />

          {/* Content */}
          <div className="mt-8">
            {currentStep === 1 && <StepSelectTable onClose={handleClose} />}
            {currentStep === 2 && <StepBuildCart />}
            {currentStep === 3 && <StepConfirmOrder onClose={handleClose} />}
          </div>
        </div>
      </div>
    </div>
  );
};
