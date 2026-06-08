import { useOrderCartStore } from '../store/useOrderCartStore.js';
 
const STEPS = [
  { id: 1, label: 'Seleccionar Mesa', icon: '🪑' },
  { id: 2, label: 'Armar Pedido',     icon: '🛒' },
  { id: 3, label: 'Confirmar',        icon: '✓'  },
];
 
export const StepperOrderFlow = () => {
  const currentStep = useOrderCartStore((s) => s.currentStep);
 
  return (
    <div className="or-stepper">
      {STEPS.map((step, index) => (
        <div key={step.id} className="or-step-item">
          <div className={`or-step-circle${step.id < currentStep ? ' or-step-circle--done' : step.id === currentStep ? ' or-step-circle--active' : ''}`}>
            {step.icon}
          </div>
          <div className="or-step-info">
            <p className={`or-step-label${step.id < currentStep ? ' or-step-label--done' : step.id === currentStep ? ' or-step-label--active' : ''}`}>
              {step.label}
            </p>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`or-step-line${step.id < currentStep ? ' or-step-line--done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};
 