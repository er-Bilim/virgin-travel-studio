import type { TourSetType } from '@/types/tourSets';
import {
  cn,
  formatDateToWords,
  formatToReadablePrice,
  getDayMonth,
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

  return (
    <div
      className={cn(
        'cursor-pointer border-2 rounded-xl p-5 hover:border-cyan-600 hover:scale-103 duration-200 relative',
        isSelectedTourSet && 'border-2 border-[var(--navy-700)]',
      )}
      onClick={() => getTourSet(tourSet._id)}
    >
      {isSelectedTourSet && (
        <div className="absolute -top-3 left-4 text-xs py-1 px-3 uppercase text-cyan-400 bg-[var(--navy-700)] flex flex-row items-center gap-1.5 rounded-md font-semibold tracking-wide">
          <CircleCheck className="size-3.5" />
          <span>Выбран</span>
        </div>
      )}

      {tourSet.isHot && (
        <div className="absolute -top-3 right-10 text-xs py-1 px-3 uppercase text-red-50 bg-red-500 flex flex-row items-center gap-1.5 rounded-md font-semibold tracking-wide">
          <Flame className="size-4 stroke-3" />
          <span>горящий</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-10">
          <div className="flex flex-row items-center gap-2">
            <div
              className={cn(
                'text-[var(--primary)] border-1 rounded-lg size-[60px] text-center bg-violet-50',
                isSelectedTourSet && 'bg-[var(--navy-700)] text-white',
              )}
            >
              <p className="after:ms-1 inline-flex flex-col">
                <span
                  className={cn(
                    'text-sm text-gray-400',
                    isSelectedTourSet && 'text-cyan-400',
                  )}
                >
                  {formatDateToWords(tourSet.startDate, true)}
                </span>
                <span className="font-semibold text-2xl">
                  {getDayMonth(tourSet.startDate)}
                </span>
              </p>
            </div>
            <ArrowBigRight className="text-gray-400 stroke-1" />
            <div
              className={cn(
                'text-[var(--primary)] border-1 rounded-lg size-[60px] text-center bg-violet-50',
                isSelectedTourSet && 'bg-[var(--navy-700)] text-white',
              )}
            >
              <p className="after:ms-1 inline-flex flex-col">
                <span
                  className={cn(
                    'text-sm text-gray-400',
                    isSelectedTourSet && 'text-cyan-400',
                  )}
                >
                  {formatDateToWords(tourSet.endDate, true)}
                </span>
                <span className="font-semibold text-2xl">
                  {getDayMonth(tourSet.endDate)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-1 items-center gap-3">
              <div className="bg-gray-100 p-1 rounded-sm">
                <Hotel
                  className={cn('size-5', isSelectedTourSet && 'text-cyan-600')}
                />
              </div>
              <div>
                <p className="uppercase text-xs text-gray-400">отель</p>
                <p className="text-[var(--navy-700)] font-semibold">
                  {tourSet.hotelName}
                </p>
                <span className="block font-normal text-muted-foreground text-sm">
                  {tourSet.hotelLocation}
                </span>
              </div>
            </div>

            <div className="flex flex-row gap-1 items-center gap-3">
              <div className="bg-gray-100 p-1 rounded-sm">
                <Plane
                  className={cn('size-5', isSelectedTourSet && 'text-cyan-600')}
                />
              </div>
              <div>
                <p className="uppercase text-xs text-gray-400">перелёт</p>
                <p className="text-[var(--navy-700)] font-semibold">
                  {tourSet.airline}
                </p>
                <span className="block font-normal text-muted-foreground text-sm">
                  {tourSet.flightDetails}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex flex-col">
            <p
              className={cn(
                'uppercase text-xs text-gray-400',
                tourSet.discountPrice && 'line-through',
              )}
            >
              {tourSet.discountPrice ? defaultPriceInfo.price : 'цена'}
            </p>
            <p
              className={cn(
                'text-[var(--navy-700)] font-semibold text-2xl',
                discountPriceInfo && 'text-emerald-500',
              )}
            >
              {tourSet.discountPrice
                ? discountPriceInfo?.price
                : defaultPriceInfo.price}
            </p>
            <p className="uppercase text-xs text-gray-400 font-semibold">
              {defaultPriceInfo.currency}
            </p>
          </div>

          <div
            className={cn(
              'px-3 py-1 border-1 rounded-xl text-center text-sm mt-3',
              styles[level].style,
            )}
          >
            <p className={cn('font-semibold inline-flex gap-1 items-center')}>
              <Icon className="size-4" />
              <span>{freeSeats === 0 ? 'Мест нет' : `${freeSeats} мест`}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourSetCard;
