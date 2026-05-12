import { useOrderCartStore } from '../store/useOrderCartStore.js';

const steps = [
  { id: 1, label: 'Seleccionar Mesa', icon: '🪑' },
  { id: 2, label: 'Armar Pedido', icon: '🛒' },
  { id: 3, label: 'Confirmar', icon: '✓' },
];

export const StepperOrderFlow = () => {
  const currentStep = useOrderCartStore((s) => s.currentStep);

  return (
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step Circle */}
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
              transition-all duration-300
              ${
                step.id <= currentStep
                  ? 'bg-gradient-to-r from-[#D4984E] to-[#B8860B] text-white shadow-md'
                  : 'bg-[#E2D4B7] text-[#4b4b4b] border border-[#d8c8a6]'
              }
            `}
          >
            {step.icon}
          </div>

          {/* Step Label */}
          <div className="ml-3 flex-1">
            <p
              className={`text-sm font-semibold transition-colors ${
                step.id <= currentStep ? 'text-[#D4984E]' : 'text-[#4b4b4b]'
              }`}
            >
              {step.label}
            </p>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 bg-[#E2D4B7] rounded relative -left-8">
              {step.id < currentStep && (
                <div className="h-full bg-gradient-to-r from-[#D4984E] to-[#B8860B] rounded"></div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
