import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  currentStep?: number;
}

const OrderSteps = ({ steps, currentStep = -1 }: Props) => {
  return (
    <div className="flex">
      {steps.map((step, index) => {
        const isDone = currentStep >= 0 && index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div
            key={step.label}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-2',
              isDone && 'step-done',
            )}
          >
            {index < steps.length - 1 && (
              <span
                className={cn(
                  'absolute top-4 h-0.5',
                  isDone ? 'bg-[var(--cyan-800)]' : 'bg-slate-200',
                )}
                style={{
                  left: 'calc(50% + 20px)',
                  right: 'calc(-50% + 20px)',
                }}
              />
            )}

            <span
              className={cn(
                'relative z-10 flex size-12 items-center justify-center rounded-full border-2 text-xl font-semibold',
                isDone &&
                  'border-[var(--cyan-800)] bg-[var(--cyan-800)] text-white',
                isCurrent &&
                  'border-[var(--navy-700)] bg-[var(--navy-700)] text-cyan-400',
                !isDone &&
                  !isCurrent &&
                  'border-slate-300 bg-white text-gray-400',
              )}
            >
              {isDone ? <Check className="size-4" /> : index + 1}
            </span>

            <span
              className={cn(
                'text-xs font-medium',
                isCurrent ? 'text-[var(--navy-700)]' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default OrderSteps;
