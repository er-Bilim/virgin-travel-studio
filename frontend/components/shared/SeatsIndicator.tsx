import type { SeatsLevel } from '@/lib/tour/seats';
import getSeatsLevel from '@/lib/tour/seats';
import { cn } from '@/lib/utils';

const styles: Record<SeatsLevel, string> = {
  available: 'text-emerald-500',
  low: 'text-amber-600',
  critical: 'text-orange-600',
  'sold-out': 'text-destructive',
};

interface Props {
  free: number;
  total: number;
  className?: string;
}

const SeatsIndicator = ({free, total, className}: Props) => {
  const level = getSeatsLevel(free, total);
  return (
    <span className={cn('font-semibold', styles[level], className)}>
      {free === 0 ? 'Мест нет' : `${free} из ${total} мест`}
    </span>
  );
};

export default SeatsIndicator;