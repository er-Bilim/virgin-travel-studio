'use client';

import ClientAvatar from '@/components/shared/ClientAvatar';
import { MapPin } from 'lucide-react';
import { IoSparkles } from 'react-icons/io5';

const ReviewsCarousel = () => {
  return (
    <>
      <div className="flex items-stretch gap-[22px] overflow-x-auto pb-4">
        <article
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
            arial-label={'Rating shab str'}
            className="mb-4 flex gap-1"
          >
            <meta itemProp="ratingValue" content="rating" />
            <meta itemProp="bestRating" content="5" />

            {/* Star component */}
          </div>

          <p
            itemProp="reviewBody"
            className="mb-5 flex-1 text-[15px] leading-relaxed text-ink"
          >
            Байкал прекрасен! Лёд прозрачный, как стекло. Организация тура
            великолепная, всё продумано до мелочей — от трансфера до экскурсий.
          </p>

          <div className="mb-5 aspect-video overflow-hidden rounded-[13px]">
            <img
              src={
                'https://www.vacationstravel.com/wp-content/uploads/2017/03/Copy-of-Copy-of-GOPR1726.jpg'
              }
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </div>

          <div className="flex items-center gap-3 border-t border-border pt-[20px]">
            <ClientAvatar name="Камила" />

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
                Камила
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-[13px] text-slate-400" />
                <span className="truncate">Зимняя экспедиция на Байкал</span>
              </div>
            </div>

            <time
              datetime="date"
              itemProp="datePublished"
              className="whitespace-nowrap text-xs text-slate-400"
            >
              20 мая
            </time>
          </div>
        </article>

        <article
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
            arial-label={'Rating shab str'}
            className="mb-4 flex gap-1"
          >
            <meta itemProp="ratingValue" content="rating" />
            <meta itemProp="bestRating" content="5" />

            {/* Star component */}
          </div>

          <p
            itemProp="reviewBody"
            className="mb-5 flex-1 text-[15px] leading-relaxed text-ink"
          >
            Лучший отдых в моей жизни. Малая группа, личный менеджер всегда на связи. Внимание к деталям на каждом шаге — чувствуется забота. Обязательно поедем снова, спасибо команде!
          </p>

          <div className="flex items-center gap-3 border-t border-border pt-[20px]">
            <ClientAvatar name="Камила" />

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
                Камила
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-[13px] text-slate-400" />
                <span className="truncate">Зимняя экспедиция на Байкал</span>
              </div>
            </div>

            <time
              datetime="date"
              itemProp="datePublished"
              className="whitespace-nowrap text-xs text-slate-400"
            >
              20 мая
            </time>
          </div>
        </article>
      </div>
    </>
  );
};

export default ReviewsCarousel;
