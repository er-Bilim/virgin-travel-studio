'use client';

import { useParams } from 'next/navigation';
import { useOneTourSet } from '@/lib/hooks/tourSets';
import TourGallery from '@/components/tourGallery/TourGallery';
import {
  Hotel,
  Plane,
  Flame,
  Calendar1,
  MapPin,
  Star,
  Dot,
  BadgeCheck,
  MessageSquareDashed,
} from 'lucide-react';
import { OrderCard } from '@/components/dashboard/orders/OrderCard';
import { useState } from 'react';
import CreateReviewForm from '@/components/public/reviews/form/CreateReviewForm';
import {
  cn,
  formatDateToWords,
  formatToReadablePrice,
  getDayMonth,
  getYearFullNumber,
} from '@/lib/utils';
import SeatsIndicator from '@/components/shared/SeatsIndicator';
import { buildTourInquiryMessage, openWhatsApp } from '@/lib/whatsapp';
import { FaWhatsapp } from 'react-icons/fa';
import Review from '@/components/public/reviews/Review';
import { Spinner } from '@/components/ui/spinner';
import { useInfiniteReviews } from '@/lib/hooks/reviewHooks';

export default function TourSetPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, isError } = useOneTourSet(slug);
  const tourId = data?.tourId?._id;
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isError: isReviewsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteReviews(tourId);
  const reviews = reviewsData?.pages.flatMap((page) => page.reviews) ?? [];

  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const openModalOrder = () => {
    setIsOrderOpen(true);
  };

  const closeModalOrder = () => {
    setIsOrderOpen(false);
  };

  if (isLoading)
    return <div className="text-center py-20 text-white">Загрузка...</div>;
  if (isError)
    return (
      <div className="text-center py-20 text-red-500">
        Ошибка при загрузке данных
      </div>
    );
  if (!data)
    return <div className="text-center py-20 text-white">Тур не найден</div>;

  const { tourId: tour, ...set } = data;

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(set.endDate).getTime() - new Date(set.startDate).getTime()) /
        (1000 * 3600 * 24),
    ),
  );
  const nights = Math.max(days - 1, 0);
  // const seatsLeft = Math.max(set.totalSeats - set.bookedSeats, 0);

  // const savings = set.discountPrice ? set.price - set.discountPrice : 0;

  const handleWhatsAppClick = () => {
    const message = buildTourInquiryMessage(
      data.tourId.title ?? 'тур',
      data.startDate,
    );
    openWhatsApp(message);
  };

  const renderReviews = () => {
    if (isLoadingReviews) {
      return <Spinner />;
    }

    if (isReviewsError) {
      return (
        <p className="text-lg text-muted-foreground font-semibold">Ошибка</p>
      );
    }

    if (!reviews?.length) {
      return (
        <div className="border-1 border-[var(--border)] rounded-xl p-4 text-gray-600 h-35 flex flex-col justify-center gap-4 items-center">
          <p className="text-gray-400 bg-gray-200 p-3 rounded-full">
            <MessageSquareDashed />
          </p>
          <p>Здесь появятся отзывы путешественников.</p>
        </div>
      );
    }

    return (
      <>
        {reviews.map((review) => (
          <Review review={review} key={review._id} />
        ))}
      </>
    );
  };

  const renderRating = () => {
    return (
      <div className="flex gap-1 items-center">
        <Star className="stroke-2 stroke-yellow-400 text-yellow-400" />
        <span className="text-[var(--primary)] font-semibold">
          {tour.rating > 0 ? tour.rating : 'нет оценок :('}
        </span>
        <Dot className="stroke-1 size-4" />
        <p className="font-semibold flex gap-1">
          {tour.ratingCount > 0 ? tour.ratingCount : 'нет'}
          <span className="font-normal">отзывов</span>
        </p>
      </div>
    );
  };

  return (
    <>
      {data._id && (
        <OrderCard
          isOpen={isOrderOpen}
          onClose={closeModalOrder}
          tourSetId={data._id}
        />
      )}
      <section aria-labelledby="tour-title" className="mt-5 relative">
        {/* <nav aria-label="Хлебные крошки">Хлебные крошки</nav> */}
        <div className="flex items-center gap-4 absolute z-1 top-3 left-3 text-xs">
          {set.isHot && (
            <p className="flex gap-2 bg-blur bg-red-500 text-red-50 border-1 border-red-500 rounded-4xl uppercase font-semibold px-4 py-2 items-center">
              <Flame className="size-4" />
              Горящий
            </p>
          )}
          <p className="flex gap-2 bg-slate-100 text-slate-500 border-1 border-slate-500 rounded-4xl uppercase font-semibold px-4 py-2">
            {tour.category.title}
          </p>
        </div>

        <TourGallery images={tour.images} title={tour.title} />

        <header>
          <h1
            id="tour-title"
            className="text-[var(--primary)] font-semibold text-[1.8rem] mt-7"
          >
            {tour.title}
          </h1>
          <div className="flex text-gray-500 gap-6 text-sm mt-3">
            <div className="flex gap-1 items-center">
              <Calendar1 className="stroke-1" />
              <span className="font-semibold">
                {getDayMonth(data.startDate)}–{getDayMonth(data.endDate)}
              </span>
              <span>{formatDateToWords(data.startDate)}</span>
              <span className="font-semibold">
                {getYearFullNumber(data.endDate)}
              </span>
            </div>

            <div className="flex gap-1 items-center">
              <MapPin className="stroke-1" />
              <span>{data.hotelLocation}</span>
            </div>

            {renderRating()}
          </div>
        </header>
      </section>

      <div className="grid grid-cols-[1fr_420px] gap-6">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="description-title" className="mt-6">
            <h2 id="description-title" className="font-semibold text-[1.3rem]">
              Описание
            </h2>
            <p className="mt-3">{tour.description}</p>
          </section>

          <section aria-labelledby="logistics-title">
            <h2 id="logistics-title" className="sr-only">
              Логистика
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <article className="border-1 border-[var(--border)] p-5 rounded-2xl bg-gray-50">
                <p className="flex gap-2 uppercase font-semibold text-gray-400 text-sm">
                  <Hotel className="stroke-2 size-4" />
                  <span>Проживание</span>
                </p>
                <p className="font-semibold text-[var(--primary)] mt-3">
                  {data.hotelName}
                </p>
                <p className="text-gray-500 mt-1">{data.hotelLocation}</p>
              </article>
              <article className="border-1 border-[var(--border)] p-5 rounded-2xl bg-gray-50">
                <p className="flex gap-2 uppercase font-semibold text-gray-400 text-sm">
                  <Plane className="stroke-2 size-4" />
                  <span>Перелёт</span>
                </p>
                <p className="font-semibold text-[var(--primary)] mt-3">
                  {data.airline}
                </p>
                <p className="text-gray-500 mt-1">{data.flightDetails}</p>
              </article>
            </div>
          </section>

          <section aria-labelledby="advantages-title">
            <h2 id="advantages-title" className="font-semibold text-[1.3rem]">
              Преимущества тура
            </h2>
            <ul className="grid grid-flow-col gap-x-[30px] mt-5">
              {tour.baseAdvantages.map((advantage, index) => (
                <li
                  key={advantage + index}
                  className="border-1 border-[var(--silver)] rounded-xl p-2 text-center flex items-center gap-5"
                >
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#FFF4B8] via-[#FFD700] to-[#DAA520]">
                    <BadgeCheck className="w-8 h-8 text-white stroke-2" />
                  </div>

                  <p>{advantage}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-border pt-10">
            <CreateReviewForm tourId={tourId} />

            <div className="flex items-center direction-row  border-t border-border pt-5 mt-8 justify-between">
              <h2 id="reviews-title" className="font-semibold text-[1.3rem] ">
                Отзывы путешественников
              </h2>
              {renderRating()}
            </div>
            <div className="flex flex-col gap-3 mt-6">{renderReviews()}</div>
            {hasNextPage && (
              <button
                aria-label='загрузить еще отзывов'
                className="text-center border-1 border-[var(--silver)] rounded-lg p-3 mt-5 w-full font-semibold cursor-pointer"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? <Spinner /> : `Загрузить еще`}
              </button>
            )}
          </section>
        </div>

        <aside aria-labelledby="booking-title">
          <h2 id="booking-title" className="sr-only">
            Бронирование
          </h2>
          <div className="border-1 border-[var(--border)] p-4 rounded-2xl text-gray-400">
            <p className="uppercase text-gray-400 text-sm">стоимость</p>
            <div className="flex flex-row gap-3 items-end mt-3 mb-4">
              {set.discountPrice && (
                <p className="text-[var(--primary)] font-semibold text-2xl">
                  {formatToReadablePrice(set.discountPrice)}
                </p>
              )}
              <p
                className={cn(
                  'font-semibold',
                  set.discountPrice
                    ? 'line-through text-sm text-gray-300'
                    : 'text-[var(--primary)] text-[1.5rem]',
                )}
              >
                {formatToReadablePrice(set.price)}
              </p>
            </div>
            {set.discountPrice && (
              <p className="text-xs text-red-500 font-semibold flex gap-1 mt-1 mb-5">
                Скидка до
                <span>{getDayMonth(data.saleDeadline)}</span>
                <span>{formatDateToWords(data.saleDeadline)}</span>
              </p>
            )}

            <dl className="flex flex-col gap-5 border-t border-border pt-5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Даты</dt>
                <dd className="font-semibold text-foreground flex gap-1">
                  <span className="font-semibold">
                    {getDayMonth(data.startDate)}–{getDayMonth(data.endDate)}
                  </span>
                  <span>{formatDateToWords(data.startDate)}</span>
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Длительность</dt>
                <dd className="font-semibold text-foreground">
                  <span>
                    {days} дн. / {nights} ноч.
                  </span>
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Свободно</dt>
                <dd className="font-semibold text-amber-600">
                  <SeatsIndicator
                    free={data.bookedSeats}
                    total={data.totalSeats}
                  />
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex gap-y-3 flex-col">
              <button
                type="button"
                aria-label="Оставить заявку"
                onClick={() => openModalOrder()}
                className="w-full cursor-pointer bg-[var(--primary)] text-gray-50 rounded-lg py-4 font-semibold transition duration-300 ease-in-out hover:bg-gray-50 hover:text-[var(--primary)] hover:border-[var(--primary)] border-1"
              >
                Оставить заявку
              </button>
              <button
                className="flex gap-2 justify-center items-center text-center w-full cursor-pointer text-[var(--primary)] border-1 border-gray-400 rounded-lg py-2 font-semibold transition duration-300 ease-in-out hover:bg-green-500 hover:text-green-50"
                onClick={handleWhatsAppClick}
                type="button"
                aria-label="Связаться через WhatsAppу"
              >
                <FaWhatsapp className="size-9" />
                <p>WhatsApp</p>
              </button>
            </div>
            <p className="text-sm text-center mt-5 mb-4">
              С вами свяжутся в течение часа
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
