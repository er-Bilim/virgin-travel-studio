'use client';

import Link from 'next/link';

import BasePhoto from '@/components/assets/lake.webp';
import CountdownTimer from '@/components/public/tours/CountdownTimer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { imageUrl } from '@/lib/constants';
import type { TourType } from '@/types/tour';
import type { TourSetType } from '@/types/tourSets';

type Props = {
  tour: TourType;
  tourSets: TourSetType[];
};

const PublicTourCard = ({ tour, tourSets }: Props) => {
  const image =
      tour.images.length > 0 ? imageUrl + tour.images[0] : BasePhoto.src;

  const availableTourSets = tourSets.filter(
      (tourSet) =>
          tourSet.tourId._id === tour._id &&
          tourSet.status !== 'FINISHED',
  );

  const firstTourSet = availableTourSets[0];

  return (
      <Card className="flex h-full min-h-162.5 flex-col overflow-hidden rounded-3xl border-0 bg-white shadow-xl">
        <div className="relative h-72 shrink-0 overflow-hidden">
          <img
              src={image}
              alt={tour.title}
              className="h-full w-full object-cover transition duration-700 hover:scale-110"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute left-5 top-5">
            <Badge className="rounded-full bg-white/90 px-4 py-1 text-[#1E2B6D]">
              {tour.category.title}
            </Badge>
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="line-clamp-2 min-h-16 text-2xl font-black text-white">
              {tour.title}
            </h2>

            <p className="mt-2 line-clamp-2 min-h-10 text-sm text-white/80">
              {tour.description}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="min-h-22.5">
            <div className="flex flex-wrap gap-2">
              {tour.baseAdvantages.slice(0, 3).map((advantage) => (
                  <span
                      key={advantage}
                      className="rounded-full bg-[#F7F8F4] px-3 py-1 text-xs font-medium text-[#1E2B6D]"
                  >
                {advantage}
              </span>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              ДОСТУПНЫЕ ПОТОКИ
            </h3>

            <div className="min-h-37.5">
              {!firstTourSet ? (
                  <p className="flex h-37.5 items-center rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                    Сейчас нет доступных потоков
                  </p>
              ) : (
                  <Link
                      href={`/tourSets/${firstTourSet._id}`}
                      className="relative block h-37.5 rounded-2xl border border-gray-100 bg-[#1E2B6D] p-4 text-white transition hover:-translate-y-0.5 hover:bg-[#176C99]"
                  >
                    {firstTourSet.isHot && (
                        <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white shadow-lg">
                    HOT
                  </span>
                    )}

                    <div className="grid h-full grid-cols-[1fr_auto] gap-4">
                      <div className="flex min-w-0 flex-col justify-between pr-2">
                        <p className="whitespace-nowrap text-xs text-white/70">
                          {new Date(firstTourSet.startDate).toLocaleDateString('ru-RU', { timeZone: 'UTC' })}
                          {' — '}
                          {new Date(firstTourSet.endDate).toLocaleDateString('ru-RU', { timeZone: 'UTC' })}
                        </p>

                        <p className="line-clamp-2 text-sm leading-relaxed text-white/85">
                          {firstTourSet.bookedSeats} человек уже присоединились
                        </p>

                        <p className="line-clamp-2 text-xs leading-relaxed text-white/70">
                          До конца акции:{' '}
                          <span className="font-bold text-yellow-300">
                        <CountdownTimer
                            saleDeadline={firstTourSet.saleDeadline}
                        />
                      </span>
                        </p>
                      </div>

                      <div className="flex min-w-20.5 shrink-0 flex-col items-end justify-center text-right">
                        <p className="text-[10px] uppercase leading-none text-white/60">
                          от
                        </p>

                        <p className="whitespace-nowrap text-xl font-black leading-tight text-white">
                          {(firstTourSet.discountPrice ??
                              firstTourSet.price
                          ).toLocaleString('ru-RU')}
                        </p>

                        <p className="text-xs font-bold leading-none text-white">
                          сом
                        </p>
                      </div>
                    </div>
                  </Link>
              )}
            </div>

            <Button
                asChild
                className="mt-4 w-full rounded-2xl bg-[#1E2B6D] py-6 font-bold text-white hover:bg-[#176C99]"
            >
              <Link href="/tourSets">
                Смотреть все потоки
              </Link>
            </Button>
          </div>
        </div>
      </Card>
  );
};

export default PublicTourCard;