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
      tourSet.tourId._id === tour._id && tourSet.status !== 'FINISHED',
  );

  return (
    <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-xl">
      <div className="relative h-72 overflow-hidden">
        <img
          src={image}
          alt={tour.title}
          className="h-full w-full object-cover transition duration-700 hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute left-5 top-5">
          <Badge className="rounded-full bg-white/90 px-4 py-1 text-[#1E2B6D]">
            {tour.category.title}
          </Badge>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <h2 className="text-2xl font-black text-white">{tour.title}</h2>

          <p className="mt-2 line-clamp-2 text-sm text-white/80">
            {tour.description}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap gap-2">
          {tour.baseAdvantages.map((advantage) => (
            <span
              key={advantage}
              className="rounded-full bg-[#F7F8F4] px-3 py-1 text-xs font-medium text-[#1E2B6D]"
            >
              {advantage}
            </span>
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
            Доступные потоки
          </h3>

          {availableTourSets.length === 0 ? (
            <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
              Сейчас нет доступных потоков
            </p>
          ) : (
            <div className="space-y-3">
              {availableTourSets.map((tourSet) => {
                const price = tourSet.discountPrice ?? tourSet.price;

                return (
                  <Link
                    key={tourSet._id}
                    href={`/tourSets/${tourSet._id}`}
                    className="block rounded-2xl border border-gray-100 bg-[#1E2B6D] p-4 text-white transition hover:-translate-y-0.5 hover:bg-[#176C99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {tourSet.isHot && (
                            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white">
                              HOT
                            </span>
                          )}

                          <span className="text-xs text-white/70">
                            {new Date(tourSet.startDate).toLocaleDateString(
                              'ru-RU',
                            )}
                            —
                            {new Date(tourSet.endDate).toLocaleDateString(
                              'ru-RU',
                            )}
                          </span>
                        </div>

                        <p className="text-sm text-white/80">
                          {tourSet.bookedSeats} человек уже присоединились
                        </p>

                        <p className="mt-1 text-xs text-white/70">
                          До конца акции:
                          <CountdownTimer saleDeadline={tourSet.saleDeadline} />
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-white/60">от</p>
                        <p className="text-lg font-black">{price} сом</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Button
          asChild
          className="w-full rounded-2xl bg-[#1E2B6D] py-6 font-bold text-white hover:bg-[#176C99]"
        >
          <Link href="/tourSets">Смотреть все потоки</Link>
        </Button>
      </div>
    </Card>
  );
};

export default PublicTourCard;
