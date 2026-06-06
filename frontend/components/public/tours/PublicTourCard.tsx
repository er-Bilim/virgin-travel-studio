import Link from 'next/link';

import BasePhoto from '@/components/assets/lake.webp';
import { imageUrl, isDev } from '@/lib/constants';
import type { TourType } from '@/types/tour';
import Image from 'next/image';
import { ArrowRight, Calendar1, Flame, MapPin, Star } from 'lucide-react';
import {
  formatDateToWords,
  formatToReadablePrice,
  getDayMonth,
  pluralize,
} from '@/lib/utils';

type Props = {
  tour: TourType;
};

const PublicTourCard = ({ tour }: Props) => {
  const image =
    tour.images.length > 0 ? imageUrl + tour.images[0] : BasePhoto.src;

  // const availableTourSets = tourSets.filter(
  //     (tourSet) =>
  //         tourSet.tourId._id === tour._id &&
  //         tourSet.status !== 'FINISHED',
  // );

  // const firstTourSet = availableTourSets[0];

  return (
    <>
      <li>
        <article itemScope itemType="https://schema.org/Product">
          <Link
            href={`/tours/${tour._id}`}
            className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1  shadow-cyan-200 hover:shadow-[0_1px_10px_rgba(0,0,0,0.1)]"
          >
            <figure className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={image}
                alt={tour.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized={isDev}
                itemProp="image"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <span
                itemProp="category"
                className="absolute top-2.5 left-2.5 z-10 bg-slate-100 rounded-xl px-5 py-1 text-sm text-[var(--primary)] font-semibold"
              >
                {tour.category.title}
              </span>

              {tour.isHot && (
                <span className="absolute top-2.5 right-2.5 z-10 capitalize flex gap-1 text-slate-50 bg-red-500 rounded-xl px-5 text-sm items-center py-1 font-semibold">
                  <Flame size={18} className="stroke-3"/> горит
                </span>
              )}
            </figure>

            <div className="p-3.5 flex flex-col gap-2.5 flex-1">
              <div>
                <h3
                  itemProp="name"
                  className="font-semibold text-lg inline-flex items-center gap-1.5"
                >
                  {tour.title}
                  <ArrowRight
                    className="size-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                    aria-hidden
                  />
                </h3>

                <p className="text-sm text-muted-foreground inline-flex gap-2 mt-3 mb-3">
                  <MapPin size={16} aria-hidden="true"/>
                  <span>{tour.hotelLocation}</span>
                </p>
              </div>

              <div className="flex gap-3.5 text-xs text-muted-foreground mb-4">
                <p className="inline-flex items-center gap-1">
                  <Calendar1 size={16} aria-hidden="true"/>
                  <span className="font-semibold">{tour.durationDays}</span>
                  <span>
                    {pluralize(tour.durationDays, 'день', 'дня', 'дней')}
                  </span>
                </p>

                <p
                  itemProp="aggregateRating"
                  itemScope
                  itemType="https://schema.org/AggregateRating"
                  className="inline-flex items-center gap-2"
                >
                  <meta itemProp="ratingValue" content={String(tour.rating)} />
                  <meta
                    itemProp="reviewCount"
                    content={String(tour.ratingCount)}
                  />
                  <Star className="stroke-2 stroke-yellow-400 text-yellow-400 size-4" aria-hidden="true"/>
                  <span className="font-semibold">{tour.rating}</span>
                </p>
              </div>

              <footer className="mt-auto pt-2.5 border-t border-muted flex items-end justify-between gap-2">
                <div
                  itemProp="offers"
                  itemScope
                  itemType="https://schema.org/Offer"
                  className="whitespace-nowrap"
                >
                  <meta itemProp="priceCurrency" content="KGS" />
                  <meta
                    itemProp="availability"
                    content="https://schema.org/InStock"
                  />

                  <span className="text-[12px] uppercase tracking-wider text-muted-foreground">
                    от
                  </span>
                  <span
                    itemProp="price"
                    content={String(tour.minPrice)}
                    className="block text-xl font-bold text-foreground"
                  >
                    {formatToReadablePrice(tour.minPrice)}
                  </span>
                </div>

                <div className="text-sm text-gray-400 flex flex-col gap-1">
                  <span className="uppercase">ближайший</span>
                  <p
                    className="inline-flex gap-1 font-semibold text-[var(--primary)]"
                    suppressHydrationWarning
                  >
                    <span>{getDayMonth(tour.nextStartDate)}</span>
                    <span>{formatDateToWords(tour.nextStartDate)}</span>
                  </p>
                </div>
              </footer>
            </div>
          </Link>
        </article>
      </li>
    </>
  );
};

export default PublicTourCard;
