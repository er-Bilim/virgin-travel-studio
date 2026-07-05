import type { TourSetType } from '@/types/tourSets';
import {
  cn,
  formatDayAndMonthWords,
  formatToReadablePrice,
} from '../../../lib/utils';
import {
  ArrowBigRight,
  CircleCheck,
  Citrus,
  Flame,
  Frown,
  Hotel,
  Plane,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import getSeatsLevel, { type SeatsLevel } from '@/lib/tour/seats';

interface Props {
  tourSet: TourSetType;
  getTourSet: (tourSet: string) => void;
  id: string;
}

const styles: Record<SeatsLevel, { style: string; icon: LucideIcon }> = {
  available: {
    style: 'bg-emerald-100 text-emerald-500 border-emerald-700',
    icon: UsersRound,
  },
  low: {
    style: 'bg-yellow-100 text-yellow-500 border-yellow-500',
    icon: Citrus,
  },
  critical: {
    style: 'bg-red-100 text-red-500 border-red-500',
    icon: Flame,
  },
  'sold-out': {
    style: 'text-gray-400 bg-gray-50',
    icon: Frown,
  },
};

const TourSetCard = ({ tourSet, getTourSet, id }: Props) => {
  const freeSeats: number = tourSet.totalSeats - tourSet.bookedSeats;
  const level = getSeatsLevel(freeSeats, tourSet.totalSeats);
  const Icon = styles[level].icon;

  const defaultPriceInfo = formatToReadablePrice(tourSet.price);
  let discountPriceInfo: { price: string; currency: string } | null = null;

  if (tourSet.discountPrice) {
    discountPriceInfo = formatToReadablePrice(tourSet.discountPrice);
  }

  const isSelectedTourSet: boolean = tourSet._id === id;

  const { day: startDay, month: startMonth } = formatDayAndMonthWords(
    tourSet.startDate,
    true,
  );

  const { day: endDay, month: endMonth } = formatDayAndMonthWords(
    tourSet.endDate,
    true,
  );

  return (
    <div
      className={cn(
        'cursor-pointer border-2 rounded-xl p-4 sm:p-5 hover:border-cyan-600 hover:scale-[1.01] duration-200 relative bg-white',
        isSelectedTourSet &&
          'border-[var(--navy-700)] hover:border-[var(--navy-700)]',
      )}
      onClick={() => getTourSet(tourSet._id)}
    >
      {isSelectedTourSet && (
        <div className="absolute -top-3 left-4 text-[10px] sm:text-xs py-1 px-2.5 uppercase text-cyan-400 bg-[var(--navy-700)] flex flex-row items-center gap-1.5 rounded-md font-semibold tracking-wide shadow-sm z-10">
          <CircleCheck className="size-3.5" />
          <span>Выбран</span>
        </div>
      )}

      {tourSet.isHot && (
        <div className="absolute -top-3 right-4 sm:right-10 text-[10px] sm:text-xs py-1 px-2.5 uppercase text-red-50 bg-red-500 flex flex-row items-center gap-1.5 rounded-md font-semibold tracking-wide shadow-sm z-10">
          <Flame className="size-3.5 stroke-3" />
          <span>горящий</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 sm:gap-6 items-center">
        <div className="flex items-center gap-2 justify-center sm:justify-start shrink-0">
          <div
            className={cn(
              'text-[var(--primary)] border rounded-lg size-[60px] flex flex-col items-center justify-center bg-violet-50/50 fallback-border',
              isSelectedTourSet &&
                'bg-[var(--navy-700)] text-white border-[var(--navy-700)]',
            )}
          >
            <span
              className={cn(
                'text-[10px] uppercase font-bold text-gray-400 tracking-wider',
                isSelectedTourSet && 'text-cyan-400',
              )}
            >
              {startMonth}
            </span>
            <span className="font-bold text-xl leading-none mt-0.5">
              {startDay}
            </span>
          </div>

          <ArrowBigRight className="text-gray-400 stroke-1 size-5 shrink-0" />

          <div
            className={cn(
              'text-[var(--primary)] border rounded-lg size-[60px] flex flex-col items-center justify-center bg-violet-50/50 fallback-border',
              isSelectedTourSet &&
                'bg-[var(--navy-700)] text-white border-[var(--navy-700)]',
            )}
          >
            <span
              className={cn(
                'text-[10px] uppercase font-bold text-gray-400 tracking-wider',
                isSelectedTourSet && 'text-cyan-400',
              )}
            >
              {endMonth}
            </span>
            <span className="font-bold text-xl leading-none mt-0.5">
              {endDay}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-0 w-full">
          <div className="flex items-start gap-3 min-w-0">
            <div className="bg-slate-100 p-1.5 rounded-md shrink-0 mt-0.5">
              <Hotel
                className={cn(
                  'size-4 text-slate-500',
                  isSelectedTourSet && 'text-cyan-600',
                )}
              />
            </div>
            <div className="min-w-0">
              <p className="uppercase text-[9px] font-bold tracking-wider text-gray-400 leading-none mb-0.5">
                отель
              </p>
              <p className="text-[var(--navy-700)] font-semibold text-sm truncate">
                {tourSet.hotelName}
              </p>
              <span className="block font-normal text-muted-foreground text-xs truncate">
                {tourSet.hotelLocation}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 min-w-0">
            <div className="bg-slate-100 p-1.5 rounded-md shrink-0 mt-0.5">
              <Plane
                className={cn(
                  'size-4 text-slate-500',
                  isSelectedTourSet && 'text-cyan-600',
                )}
              />
            </div>
            <div className="min-w-0">
              <p className="uppercase text-[9px] font-bold tracking-wider text-gray-400 leading-none mb-0.5">
                перелёт
              </p>
              <p className="text-[var(--navy-700)] font-semibold text-sm truncate">
                {tourSet.airline}
              </p>
              <span className="block font-normal text-muted-foreground text-xs truncate">
                {tourSet.flightDetails}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 mt-2 sm:mt-0 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100 shrink-0 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <p
              className={cn(
                'uppercase text-[10px] font-bold tracking-wider text-gray-400 leading-none',
                tourSet.discountPrice && 'line-through',
              )}
            >
              {tourSet.discountPrice ? defaultPriceInfo.price : 'цена'}
            </p>
            <div className="flex items-baseline gap-0.5 mt-0.5 sm:justify-end">
              <span
                className={cn(
                  'text-[var(--navy-700)] font-bold text-xl sm:text-2xl tracking-tight',
                  discountPriceInfo && 'text-emerald-500',
                )}
              >
                {tourSet.discountPrice
                  ? discountPriceInfo?.price
                  : defaultPriceInfo.price}
              </span>
              <span className="uppercase text-[10px] font-bold text-gray-400 ml-0.5">
                {defaultPriceInfo.currency}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'px-3 py-1 border rounded-xl text-center text-xs shadow-sm shrink-0',
              styles[level].style,
            )}
          >
            <div className="font-semibold flex gap-1.5 items-center justify-center">
              <Icon className="size-3.5" />
              <span>{freeSeats === 0 ? 'Мест нет' : `${freeSeats} мест`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourSetCard;