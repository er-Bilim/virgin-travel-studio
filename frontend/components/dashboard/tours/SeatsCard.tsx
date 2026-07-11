import type { SeatsLevel } from '@/lib/tour/seats';
import getSeatsLevel from '@/lib/tour/seats';
import { cn } from '@/lib/utils';
import { TriangleAlert, UsersRound } from 'lucide-react';

interface Props {
  totalSeats: number;
  bookedSeats: number;
}

const styles: Record<SeatsLevel, { text: string; bg: string }> = {
  available: { text: 'text-emerald-500', bg: 'bg-emerald-500' },
  low: { text: 'text-yellow-500', bg: 'bg-yellow-500' },
  critical: { text: 'text-red-500', bg: 'bg-red-500' },
  'sold-out': { text: 'text-gray-400', bg: 'bg-gray-400' },
};

const SeatsCard = ({ totalSeats, bookedSeats }: Props) => {
  const getSeatLevelText = (level: SeatsLevel) => {
    switch (level) {
      case 'available':
        return `Забронировано ${bookedSeats} из ${totalSeats}`;
      case 'low':
        return `Среднее количество мест – забронировано ${bookedSeats} из ${totalSeats}`;
      case 'critical':
        return `Осталось мало мест – забронировано ${bookedSeats} из ${totalSeats}`;
      default:
        return '';
    }
  };

  const freeSeats = totalSeats - bookedSeats;
  const seatLevel = getSeatsLevel(freeSeats, totalSeats);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <h3 className="text-[12px] font-bold uppercase tracking-wide text-navy-700 mb-4 flex items-center gap-2">
        <UsersRound className="text-cyan-800 size-4 sm:size-5" />
        Свободные места
      </h3>
      <div>
        <div className="flex items-end gap-1.5 mb-2.5">
          <span
            className={cn(
              `${styles[seatLevel].text} text-3xl sm:text-4xl font-black leading-none`,
            )}
          >
            {freeSeats}
          </span>
          <span className="text-navy-700/50 text-xs sm:text-sm font-semibold mb-0.5">
            / <span>{totalSeats}</span> мест
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn(
              `${styles[seatLevel].bg} h-full rounded-full transition-all`,
            )}
            style={{
              width: `${Math.max(
                0,
                Math.min(100, totalSeats ? (freeSeats / totalSeats) * 100 : 0),
              )}%`,
            }}
          />
        </div>
        <p
          className={cn(`mt-3 text-[12px] ${styles[seatLevel].text} font-bold`)}
        >
          {getSeatLevelText(seatLevel)}
        </p>
      </div>
      {seatLevel === 'sold-out' && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3.5 flex items-start gap-3">
          <TriangleAlert className="size-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Мест нет</p>
            <p className="text-[12px] text-red-600 mt-0.5">
              Все {totalSeats} мест заняты. Бронирование недоступно
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SeatsCard;
