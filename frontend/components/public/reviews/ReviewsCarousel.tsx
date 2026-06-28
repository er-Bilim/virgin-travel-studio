'use client';

import ClientAvatar from '@/components/shared/ClientAvatar';
import Rating from '@/components/shared/Rating';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { imageUrl } from '@/lib/constants';
import { useGetFeaturedReviews } from '@/lib/hooks/reviewHooks';
import { cn, formatDayAndMonthWords } from '@/lib/utils';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { IoSparkles } from 'react-icons/io5';

const ReviewsCarousel = () => {
  const { data: reviews } = useGetFeaturedReviews();
  const [api, setApi] = useState<CarouselApi>();

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

  return (
    <>
      <Carousel setApi={setApi}>
        <CarouselContent className="select-none cursor-grab active:cursor-grabbing">
          {reviews &&
            reviews.map((review) => {
              const { day, month } = formatDayAndMonthWords(review.createdDate);

              return (
                <CarouselItem
                  key={review._id}
                  className="basis-1/2 lg:basis-1/3"
                >
                  <article
                    itemScope
                    itemType="https://schema.org/Review"
                    className="flex h-full w-full flex-col rounded-[20px] border border-border p-[26px]"
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
                      arial-label={`Оценка ${review.rating} из 5`}
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
                      className="mb-5 flex-1 text-[15px] leading-relaxed text-ink"
                    >
                      {review.comment}
                    </p>

                    {review.image && (
                      <div className="mb-5 aspect-video overflow-hidden rounded-[13px]">
                        <img
                          src={`${imageUrl}${review.image}`}
                          alt={`Фото к отзыву от ${review.clientName}`}
                          loading="lazy"
                          className="size-full object-cover"
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
            'flex size-11 items-center justify-center rounded-full border border-border bg-white text-navy-700 transition', canScrollPrev ? "hover:border-navy-700 hover:bg-navy-700 hover:text-white cursor-pointer" : "border-gray-200 text-gray-200"
          )}
          type="button"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => api?.scrollNext()}
          aria-label="вперед"
          className={cn(
            'flex size-11 items-center justify-center rounded-full border border-border bg-white text-navy-700 transition', canScrollNext ? "hover:border-navy-700 hover:bg-navy-700 hover:text-white cursor-pointer" : "border-gray-200 text-gray-200"
          )}
          type="button"
        >
          <ChevronRight />
        </button>
      </div>
    </>
  );
};

export default ReviewsCarousel;
