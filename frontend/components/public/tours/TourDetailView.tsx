'use client';

import TourGallery from '@/components/tourGallery/TourGallery';
import {
  BadgePercent,
  Calendar1,
  CalendarHeart,
  Check,
  Clock3,
  Dot,
  Flame,
  Hotel,
  MapPin,
  MessageSquareDashed,
  Plane,
  Send,
  ShieldCog,
  Star,
  UsersRound
} from 'lucide-react';
import {useMemo, useState} from 'react';
import CreateReviewForm
  from '@/components/public/reviews/form/CreateReviewForm';
import {
  formatDayAndMonthWords,
  formatToReadablePrice,
  pluralize
} from '@/lib/utils';
import SeatsIndicator from '@/components/shared/SeatsIndicator';
import {buildTourInquiryMessage, openWhatsApp} from '@/lib/whatsapp';
import {FaWhatsapp} from 'react-icons/fa';
import Review from '@/components/public/reviews/Review';
import {Spinner} from '@/components/ui/spinner';
import {useInfiniteReviews} from '@/lib/hooks/reviewHooks';
import {Breadcrumbs} from '@/components/shared/Breadcrumbs';
import {useTourById} from '@/lib/hooks/tourHooks';
import TourSetCard from './TourSetCard';
import type {TourSetType} from '@/types/tourSets';
import OrderCard from '@/components/dashboard/orders/OrderCard';
import TourDetailLoading from '@/app/(public)/tours/[slug]/loading';
import type {DateRange} from 'react-day-picker';
import {DateRangePicker} from '@/components/shared/DateRangePicker';

interface Props {
  id: string;
}

const TourDetailView = ({ id }: Props) => {
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const { data: tour, isPending, isError } = useTourById(id);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const visibleTours = useMemo(() => {
    if (!dateRange?.from) return tour?.tourSets;

    return tour?.tourSets.filter((ts) => {
      const start = new Date(ts.startDate);

      if (dateRange.from && start < dateRange.from) return false;
      if (dateRange.to && start > dateRange.to) return false;
      return true;
    });
  },[tour?.tourSets, dateRange]);

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isError: isReviewsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteReviews(id);

  if (isPending) {
    return <TourDetailLoading/>;
  }

  if (isError || !tour) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Не удалось загрузить тур
      </div>
    );
  }

  const selectedTourSet: TourSetType =
    tour.tourSets.find((tourSet) => tourSet._id === selectedSetId) ??
    tour.tourSets[0] ??
    null;
  
  if (!selectedTourSet) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Сейчас нет открытых заездов. Свяжитесь с менеджером.
      </div>
    );
  }

  const { day: saleDeadlineDay, month: saleDeadlineMonth } =
    formatDayAndMonthWords(selectedTourSet.saleDeadline, true);

  const { day: startDay, month: startMonth } = formatDayAndMonthWords(
    selectedTourSet.startDate,
    true,
  );

  const { day: endDay, month: endMonth } = formatDayAndMonthWords(
    selectedTourSet.endDate,
    true,
  );

  const freeSeats: number =
    selectedTourSet.totalSeats - selectedTourSet.bookedSeats;

  const defaultPriceInfo = formatToReadablePrice(selectedTourSet.price);
  let discountPriceInfo: { price: string; currency: string } | null = null;

  if (selectedTourSet.discountPrice) {
    discountPriceInfo = formatToReadablePrice(selectedTourSet.discountPrice);
  }

  const reviews = reviewsData?.pages.flatMap((page) => page.reviews) ?? [];

  const openModalOrder = () => {
    setIsOrderOpen(true);
  };

  const closeModalOrder = () => {
    setIsOrderOpen(false);
  };

  if (!tour)
    return <div className="text-center py-20 text-white">Тур не найден</div>;

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(selectedTourSet.endDate).getTime() -
        new Date(selectedTourSet.startDate).getTime()) /
        (1000 * 3600 * 24),
    ),
  );
  const nights = Math.max(days - 1, 0);
  const activeSetsCount = tour.tourSets.filter(
    (tourSet) => tourSet.status === 'OPEN' || tourSet.status === 'CLOSED',
  ).length;

  const handleWhatsAppClick = () => {
    const message: string = buildTourInquiryMessage(
      tour?.title ?? 'тур',
      selectedTourSet?.startDate,
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
          <span className="font-normal">
            {pluralize(tour.ratingCount, 'отзыв', 'отзыва', 'отзывов')}
          </span>
        </p>
      </div>
    );
  };

  const renderPrice = () => {
    const defaultPriceJSX = (
      <>
        <p>{defaultPriceInfo.price}</p>
      </>
    );

    if (discountPriceInfo) {
      return (
        <div className="flex flex-col items-start">
          <div className="text-gray-400 text-xs inline-flex flex-row gap-1">
            <div className="line-through">{defaultPriceJSX}</div>
            <p className="text-sm lowercase text-gray-400 text-xs">
              {defaultPriceInfo.currency}
            </p>
          </div>
          <div className="text-3xl text-white font-semibold">
            <span className="text-green-400">{discountPriceInfo.price}</span>
            <span className="text-sm font-normal">
              {discountPriceInfo.currency}
            </span>
          </div>
          <div className="bg-red-500 text-white rounded-xl px-4 py-1 mt-4 inline-flex gap-1 text-sm font-semibold items-center">
            <BadgePercent className="size-4 stroke-3 me-1" />
            <span>Скидка до</span>
            <span>{saleDeadlineDay}</span>
            <span>{saleDeadlineMonth}</span>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="text-3xl text-white font-semibold">
          <span>{defaultPriceInfo.price}</span>
          <span className="text-lg font-normal text-gray-400">
            {defaultPriceInfo.currency}
          </span>
        </div>
      </>
    );
  };

  return (
    <>
      {selectedTourSet._id && (
        <OrderCard
          isOpen={isOrderOpen}
          onClose={closeModalOrder}
          tourSetId={selectedTourSet._id}
          tourTitle={tour.title}
          startDate={selectedTourSet.startDate}
          endDate={selectedTourSet.endDate}
          price={selectedTourSet.discountPrice ?? selectedTourSet.price}
        />
      )}

      <section aria-labelledby="tour-title" className="mt-10">
        <Breadcrumbs
          items={[
            { label: 'Туры', href: '/tours' },
            {
              label: tour.category.title,
              href: `/tours?category=${tour.category._id}`,
            },
            { label: tour.title },
          ]}
          className="mb-10"
        />
        <div className="relative">
          <div className="flex items-center gap-4 absolute z-1 top-3 left-3 text-xs">
            {selectedTourSet.isHot && (
              <p className="flex gap-1 bg-blur bg-red-500 text-red-50 border-1 border-red-500 rounded-4xl uppercase font-semibold px-4 py-2 items-center">
                <Flame className="size-4 stroke-3" />
                Горящий
              </p>
            )}
            <p className="flex gap-2 bg-slate-100 text-slate-500 border-1 border-slate-500 rounded-4xl uppercase font-semibold px-4 py-2">
              {tour.category.title}
            </p>
          </div>
          <TourGallery images={tour.images} title={tour.title} />
        </div>

        <header>
          <h1
            id="tour-title"
            className="text-[var(--primary)] font-semibold text-[1.8rem] mt-7"
          >
            {tour.title}
          </h1>

          <div className="flex text-gray-500 gap-6 text-sm mt-3">
            <div className="flex gap-1 items-center">
              <MapPin className="stroke-1" />
              <span>{selectedTourSet.hotelLocation}</span>
            </div>

            {renderRating()}
          </div>
        </header>
      </section>

      <div className="grid grid-cols-[1fr_420px] gap-6 mb-10">
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
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <article className="rounded-2xl border border-[var(--border)] bg-gray-50 p-4">
                <span className="mb-3 inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--navy-700)] text-cyan-400">
                  <Clock3 className="size-4.5" />
                </span>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Длительность
                </p>
                <p className="mt-0.5 font-semibold text-[var(--primary)]">
                  {days} дней
                </p>
              </article>

              <article className="rounded-2xl border border-[var(--border)] bg-gray-50 p-4">
                <span className="mb-3 inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--navy-700)] text-cyan-400">
                  <Plane className="size-4.5" />
                </span>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Перелёт
                </p>
                <p className="mt-0.5 font-semibold text-[var(--primary)]">
                  Включён
                </p>
              </article>

              <article className="rounded-2xl border border-[var(--border)] bg-gray-50 p-4">
                <span className="mb-3 inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--navy-700)] text-cyan-400">
                  <MapPin className="size-4.5" />
                </span>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Направление
                </p>
                <p className="mt-0.5 font-semibold text-[var(--primary)]">
                  {tour.category.title}
                </p>
              </article>

              <article className="rounded-2xl border border-[var(--border)] bg-gray-50 p-4">
                <span className="mb-3 inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--navy-700)] text-cyan-400">
                  <CalendarHeart className="size-4.5" />
                </span>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Заездов
                </p>
                <p className="mt-0.5 font-semibold text-[var(--primary)] inline-flex gap-1">
                  <span>{activeSetsCount}</span>
                  <span>
                    {pluralize(activeSetsCount, 'дата', 'даты', 'дат')}
                  </span>
                </p>
              </article>
            </div>
          </section>

          <section aria-labelledby="advantages-title">
            <h2 id="advantages-title" className="font-semibold text-[1.3rem]">
              Преимущества тура
            </h2>
            <ul className="flex flex-wrap gap-2.5 mt-5">
              {tour.baseAdvantages.map((advantage, index) => (
                <li
                  key={advantage + index}
                  className="inline-flex items-center gap-3 rounded-xl border border-[var(--silver)] bg-white px-4 py-3"
                >
                  <span className="advantage-check inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm font-medium text-[var(--primary)]">
                    {advantage}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="where-to-go-title"
            className="border-t border-border pt-10"
          >
            <div className="flex justify-between items-start gap-3">
              <h2
                id="where-to-go-title"
                className="font-semibold text-[1.3rem] mb-5"
              >
                Когда поехать
              </h2>
              <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-64"
              />
            </div>

            <div className="flex flex-col gap-5">
              {dateRange?.from && visibleTours?.length === 0 &&
                  <span>Заездов на эту дату не найдено</span>
              }
              {visibleTours?.map((tourSet) => (
                <TourSetCard
                  key={tourSet._id}
                  tourSet={tourSet}
                  getTourSet={setSelectedSetId}
                  id={selectedTourSet._id}
                />
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-10">
            <CreateReviewForm tourId={id} />

            <div className="flex items-center direction-row  border-t border-border pt-5 mt-8 justify-between">
              <h2 id="reviews-title" className="font-semibold text-[1.3rem]">
                Отзывы путешественников
              </h2>
              {renderRating()}
            </div>
            <div className="flex flex-col gap-3 mt-6">{renderReviews()}</div>
            {hasNextPage && (
              <button
                type="button"
                aria-label="загрузить еще отзывов"
                className="text-center border-1 border-[var(--silver)] rounded-lg p-3 mt-5 w-full font-semibold cursor-pointer"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? <Spinner /> : `Загрузить еще`}
              </button>
            )}
          </section>
        </div>

        <aside aria-labelledby="booking-title relative">
          <div className="border-1 border-[var(--border)] rounded-2xl text-[var(--navy-700)] relative">
            {selectedTourSet.isHot && (
              <div className="absolute -top-2 right-3 text-xs py-1 px-3 uppercase text-red-50 bg-red-500 flex flex-row items-center gap-1.5 rounded-xl font-semibold tracking-wide">
                <Flame className="size-4 stroke-3" />
                <span>горящий</span>
              </div>
            )}
            <div className="bg-[var(--card-foreground)] p-4 rounded-t-2xl">
              <div className="text-cyan-400 inline-flex items-center">
                <Dot />
                <h2
                  id="booking-title"
                  className="uppercase text-xs font-semibold"
                >
                  Выбранный заезд
                </h2>
              </div>

              {renderPrice()}
            </div>

            <div className="px-4">
              <dl className="flex flex-col gap-5 border-t border-border pt-5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground inline-flex gap-2 items-center">
                    <Calendar1 className="stroke-1 size-4.5" />
                    <p>Даты</p>
                  </dt>
                  <dd className="font-semibold text-foreground flex gap-1">
                    <p className="after:content-['–'] after:ml-2 after:text-gray-500">
                      <span className="me-1">{startDay}</span>
                      <span>{startMonth}</span>
                    </p>
                    <p>
                      <span className="me-1">{endDay}</span>
                      <span>{endMonth}</span>
                    </p>
                  </dd>
                </div>

                <div className="flex items-center justify-between ">
                  <dt className="text-muted-foreground inline-flex gap-2 items-center">
                    <Clock3 className="stroke-1 size-4.5" />
                    <p>Длительность</p>
                  </dt>
                  <dd className="font-semibold text-foreground">
                    <span>
                      {days} дн. / {nights} ноч.
                    </span>
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground inline-flex gap-2 items-center">
                    <UsersRound className="stroke-1 size-4.5" />
                    <p>Свободно</p>
                  </dt>
                  <dd className="font-semibold text-amber-600">
                    <SeatsIndicator
                      free={freeSeats}
                      total={selectedTourSet.totalSeats}
                    />
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground inline-flex gap-2 items-center">
                    <Hotel className="stroke-1 size-4.5" />
                    <p>Отель</p>
                  </dt>
                  <dd className="font-semibold text-right">
                    <span className="text-right">
                      {selectedTourSet.hotelName}
                    </span>
                    <span className="block font-normal text-muted-foreground mt-0.5 text-right">
                      {selectedTourSet.hotelLocation}
                    </span>
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground inline-flex gap-2 items-center">
                    <Plane className="stroke-1 size-4.5" />
                    <p>Перелёт</p>
                  </dt>
                  <dd className="font-semibold text-right">
                    <span>{selectedTourSet.airline}</span>
                    <span className="block font-normal text-muted-foreground mt-0.5">
                      {selectedTourSet.flightDetails}
                    </span>
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex gap-y-3 flex-col">
                <button
                  type="button"
                  aria-label="Оставить заявку"
                  onClick={() => openModalOrder()}
                  className="w-full cursor-pointer bg-[var(--primary)] text-gray-50 rounded-lg py-4 font-semibold transition duration-300 ease-in-out hover:bg-[var(--primary)]/80 hover:border-[var(--primary)] border-1 inline-flex items-center gap-4 justify-center"
                >
                  <Send className="text-cyan-400 size-6" />
                  <span>Оставить заявку</span>
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
              <p className="text-sm mt-5 mb-4 flex gap-3 items-center justify-center text-gray-400">
                <ShieldCog className="size-5" />
                <span>С вами свяжутся в течение часа</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default TourDetailView;
