import Link from 'next/link';

import BasePhoto from '@/components/assets/lake.webp';
import { imageUrl, isDev } from '@/lib/constants';
import type { ITourWithTourSetFields } from '@/types/tour';
import Image from 'next/image';
import { ArrowRight, Calendar1, Flame, MapPin, Star } from 'lucide-react';
import {
  cn,
  formatDayAndMonthWords,
  formatToReadablePrice,
  pluralize,
} from '@/lib/utils';
import CountdownTimer from '@/components/public/tours/CountdownTimer';

type Props = {
  tour: ITourWithTourSetFields;
};

const PublicTourCard = ({ tour }: Props) => {
  const image =
    tour.images.length > 0
      ? imageUrl + `api/tours/image/${tour.images[0]}`
      : BasePhoto.src;

  const { day, month } = formatDayAndMonthWords(tour.nextStartDate);
  const { day: saleDay, month: saleMonth } = tour.saleDeadline
    ? formatDayAndMonthWords(tour.saleDeadline, true)
    : { day: '', month: '' };

  const now = new Date().getTime();
  const deadlineTime = tour.saleDeadline
    ? new Date(tour.saleDeadline).getTime()
    : 0;
  const timeRemaining = deadlineTime - now;
  const isExpired = timeRemaining <= 0;
  const isLessThan24h = timeRemaining > 0 && timeRemaining <= 86400000;
  const shouldShowDeadline = tour.isHot && tour.saleDeadline && !isExpired;
  const { price: minPrice, currency: minCurrency } = formatToReadablePrice(
    tour.minPrice,
  );
  const { price: discountPrice, currency: discountCurrency } =
    tour.discountPrice
      ? formatToReadablePrice(tour.discountPrice)
      : { price: '', currency: '' };

  const discountPercent: number = tour.discountPrice
    ? (1 - tour.discountPrice / tour.minPrice) * 100
    : 0;

  return (
    <>
      <li className="flex">
        <article
          itemScope
          itemType="https://schema.org/Product"
          className="flex w-full"
        >
          <Link
            href={`/tours/${tour._id}`}
            className="group block flex flex-col w-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1  shadow-cyan-200 hover:border-cyan-500 hover:text-cyan-600"
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
                  <Flame size={18} className="stroke-3" /> горит
                </span>
              )}

              {shouldShowDeadline && (
                <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 text-white bg-black/65 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-1 text-sm font-medium shadow-lg">
                  {isLessThan24h ? (
                    <CountdownTimer
                      saleDeadline={tour.saleDeadline}
                      className={
                        isLessThan24h
                          ? 'animate-pulse text-red-500'
                          : 'text-gray-300'
                      }
                    />
                  ) : (
                    <span>
                      Скидка до{' '}
                      <span className="font-semibold">
                        {saleDay} {saleMonth}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </figure>

            <div className="p-3.5 flex flex-col gap-2.5 flex-1">
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
                <MapPin size={16} aria-hidden="true" />
                {tour.hotelLocation ? (
                  <span>{tour.hotelLocation}</span>
                ) : (
                  <span className="text-slate-400 font-semibold">
                    уточняется
                  </span>
                )}
              </p>

              <div className="flex gap-3.5 text-xs text-muted-foreground mb-4">
                <p className="inline-flex items-center gap-1">
                  <Calendar1 size={16} aria-hidden="true" />
                  {tour.durationDays ? (
                    <>
                      <span className="font-semibold">{tour.durationDays}</span>
                      <span>
                        {pluralize(tour.durationDays, 'день', 'дня', 'дней')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-400 font-semibold">
                        уточняется
                      </span>
                    </>
                  )}
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
                  <Star
                    className="stroke-2 stroke-yellow-400 text-yellow-400 size-4"
                    aria-hidden="true"
                  />
                  <span className="font-semibold">{tour.rating}</span>
                </p>
              </div>

              <footer className="mt-auto pt-2.5 border-t border-muted flex items-end justify-between gap-2">
                <div
                  itemProp="offers"
                  itemScope
                  itemType="https://schema.org/Offer"
                  className="whitespace-nowrap relative"
                >
                  <meta itemProp="priceCurrency" content="KGS" />
                  <meta
                    itemProp="availability"
                    content="https://schema.org/InStock"
                  />

                  <div className="flex gap-1 flex-col">
                    {tour.minPrice > 0 ? (
                      <>
                        <div className="flex flex-row gap-2">
                          <span className="text-[12px] uppercase tracking-wider text-muted-foreground">
                            от
                          </span>
                          {Number.isFinite(discountPercent) &&
                            discountPercent > 0 && (
                              <p className="text-[12px] uppercase tracking-wider text-cyan-500 bg-slate-100 font-semibold rounded-xl px-3">
                                –{discountPercent.toFixed(0)}%
                              </p>
                            )}
                        </div>
                        {tour.discountPrice && (
                          <p
                            itemProp="price"
                            content={String(tour.discountPrice)}
                            className="text-2xl font-black text-emerald-400 leading-none"
                          >
                            {discountPrice}
                            <span
                              className={cn(
                                'text-sm font-semibold text-emerald-400',
                              )}
                            >
                              {discountCurrency}
                            </span>
                          </p>
                        )}
                        <p
                          itemProp="price"
                          content={String(tour.minPrice)}
                          className={cn('block text-xl font-bold', {
                            'line-through text-slate-300 font-extralight text-[15px]':
                              tour.discountPrice,
                          })}
                        >
                          {minPrice}
                          <span
                            className={cn(
                              'text-sm font-semibold text-navy-800',
                              { 'text-slate-300': tour.discountPrice },
                            )}
                          >
                            {minCurrency}
                          </span>
                        </p>
                      </>
                    ) : (
                      <>
                        <div className=" text-navy-800 leading-tight text-xl font-black">
                          <p>Цена</p>
                          <p>по</p>
                          <p>запросу</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-400 flex flex-col gap-1">
                  <span className="uppercase">ближайший</span>

                  <p
                    className="inline-flex gap-1 font-semibold text-[var(--primary)]"
                    suppressHydrationWarning
                  >
                    <span>{day}</span>
                    <span>{month}</span>
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
