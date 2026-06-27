'use client';

import ClientAvatar from '@/components/shared/ClientAvatar';
import { imageUrl } from '@/lib/constants';
import { useGetFeaturedReviews } from '@/lib/hooks/reviewHooks';
import { formatDayAndMonthWords } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { IoSparkles } from 'react-icons/io5';

const ReviewsCarousel = () => {
  const { data: reviews } = useGetFeaturedReviews();

  return (
    <>
      <div className="flex items-stretch gap-[22px] overflow-x-auto pb-4">
        {reviews &&
          reviews.map((review) => {
            const { day, month } = formatDayAndMonthWords(review.createdDate);

            return (
              <article
                key={review._id}
                itemScope
                itemType="https://schema.org/Review"
                className="flex w-[400px] shrink-0 snap-start flex-col rounded-[20px] border border-border p-[26px] max-md:w-[300px] max-md:p-[22px]"
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
                  className="mb-4 flex gap-1"
                >
                  <meta
                    itemProp="ratingValue"
                    content={String(review.rating)}
                  />
                  <meta itemProp="bestRating" content="5" />

                  {/* Star component */}
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
            );
          })}
      </div>
    </>
  );
};

export default ReviewsCarousel;
