'use client';

import ClientAvatar from '@/components/shared/ClientAvatar';
import ErrorState from '@/components/shared/ErrorState';
import Rating from '@/components/shared/Rating';
import ReviewCarouselSkeleton from '@/components/shared/skeletons/ReviewCarouselSkeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { imageUrl, isDev } from '@/lib/constants';
import { useGetFeaturedReviews } from '@/lib/hooks/reviewHooks';
import { cn, formatDayAndMonthWords } from '@/lib/utils';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircleHeart,
  Compass,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoSparkles } from 'react-icons/io5';

const ReviewsCarousel = () => {
  const {
    data: reviews,
    isLoading,
    isError,
    refetch,
  } = useGetFeaturedReviews();
  const [api, setApi] = useState<CarouselApi>();
  const router = useRouter();

  const [canScrollPrev, setCanScrollPrev] = useState<boolean>(false);
  const [canScrollNext, setCanScrollNext] = useState<boolean>(false);

  useEffect(() => {
    if (!api) return;

    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    update();

    api.on('select', update);
    api.on('reInit', update);

    return () => {
      api.off('select', update);
      api.off('reInit', update);
    };
  }, [api]);

  if (isLoading) {
    return <ReviewCarouselSkeleton />;
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }
  
  return (
    <>
      {reviews && reviews.length > 0 ? (
        <>
          <Carousel setApi={setApi}>
            <CarouselContent className="select-none cursor-grab active:cursor-grabbing">
              {reviews &&
                reviews.map((review) => {
                  const { day, month } = formatDayAndMonthWords(
                    review.createdAt,
                  );

                  return (
                    <CarouselItem
                      key={review._id}
                      className="basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <article
                        itemScope
                        itemType="https://schema.org/Review"
                        className="flex h-full w-full flex-col rounded-[20px] border border-border p-5 sm:p-[26px] hover:border-cyan-500 hover:text-cyan-600 cursor-pointer duration-300"
                        onClick={() =>
                          router.push(`/tours/${review.tourId._id}`)
                        }
                      >
                        <div
                          aria-hidden="true"
                          className="mb-4 h-6 font-serif text-[42px] leading-[0.7] text-cyan-500"
                        >
                          <IoSparkles className="size-4" />
                        </div>

                        <div
                          itemProp="reviewRating"
                          itemScope
                          itemType="https://schema.org/Rating"
                          aria-label={`Оценка ${review.rating} из 5`}
                          className="mb-3.5 flex gap-0.5"
                        >
                          <meta
                            itemProp="ratingValue"
                            content={String(review.rating)}
                          />
                          <meta itemProp="bestRating" content="5" />

                          <Rating
                            value={review.rating}
                            starSize={4}
                            className="p-0"
                          />
                        </div>

                        <p
                          itemProp="reviewBody"
                          className="mb-5 flex-1 text-[15px] leading-relaxed text-ink "
                        >
                          {review.comment}
                        </p>

                        {review.image && (
                          <div className="relative mb-5 aspect-video overflow-hidden rounded-[13px]">
                            <Image
                              src={`${imageUrl}api/reviews/image/${review.image}`}
                              alt={`Фото к отзыву от ${review.clientName}`}
                              className="size-full object-cover"
                              fill
                              unoptimized={isDev}
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-3 border-t border-border pt-[20px]">
                          <ClientAvatar name={review.clientName} />

                          <div
                            itemProp="author"
                            itemScope
                            itemType="https://schema.org/Person"
                            className="min-w-0 flex-1"
                          >
                            <div
                              itemProp="name"
                              className="text-sm font-semibold text-navy-800"
                            >
                              {review.clientName}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="size-[13px] text-slate-400" />
                              <span className="truncate">
                                {review.tourId.title}
                              </span>
                            </div>
                          </div>

                          <time
                            itemProp="datePublished"
                            className="whitespace-nowrap text-xs text-slate-400"
                          >
                            {day} {month}
                          </time>
                        </div>
                      </article>
                    </CarouselItem>
                  );
                })}
            </CarouselContent>
          </Carousel>
          <div className="flex justify-end gap-2 mt-3 ms-auto">
            <button
              onClick={() => api?.scrollPrev()}
              aria-label="назад"
              className={cn(
                'flex size-10 sm:size-11 items-center justify-center rounded-full border border-border bg-white text-navy-700 transition',
                canScrollPrev
                  ? 'hover:border-navy-700 hover:bg-navy-700 hover:text-white cursor-pointer'
                  : 'border-gray-200 text-gray-200',
              )}
              type="button"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              aria-label="вперед"
              className={cn(
                'flex size-10 sm:size-11 items-center justify-center rounded-full border border-border bg-white text-navy-700 transition',
                canScrollNext
                  ? 'hover:border-navy-700 hover:bg-navy-700 hover:text-white cursor-pointer'
                  : 'border-gray-200 text-gray-200',
              )}
              type="button"
            >
              <ChevronRight />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 sm:px-6 sm:py-12 text-center">
            <div className="mb-[18px] flex size-16 items-center justify-center rounded-[18px] border border-border bg-white">
              <MessageCircleHeart />
            </div>

            <h3 className="mb-2 text-[19px] font-bold text-navy-700">
              Скоро здесь появятся отзывы
            </h3>

            <p className="mb-[22px] max-w-[380px] text-sm leading-relaxed text-muted-foreground">
              Мы готовим истории наших путешественников. Поделитесь своими
              впечатлениями о поездке. Лучшие отзывы попадут на главную страницу
            </p>

            <Link
              href="/tours"
              className="inline-flex items-center gap-2 rounded-xl bg-navy-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#162356]"
            >
              <Compass className="size-[17px]" />
              Смотреть туры
            </Link>
          </div>
        </>
      )}
    </>
  );
};

export default ReviewsCarousel;
