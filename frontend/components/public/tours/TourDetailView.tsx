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
import CreateReviewForm from '@/components/public/reviews/form/CreateReviewForm';
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
import {cn} from '@/lib/utils';

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
      return !(dateRange.to && start > dateRange.to);

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
    tour.tourSets.find((tourSet) => tourSet._id === selectedSetId)
    ?? tour.tourSets[0]
    ?? null;

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
        <p className="text-lg text-muted-foreground font-semibold text-center">Ошибка</p>
      );
    }

    if (!reviews?.length) {
      return (
        <div className="border border-[var(--border)] rounded-xl p-6 text-gray-600 h-35 flex flex-col justify-center gap-3 items-center max-w-2xl mx-auto w-full">
          <p className="text-gray-400 bg-gray-200 p-2.5 rounded-full">
            <MessageSquareDashed className="size-5" />
          </p>
          <p className="text-sm text-center">Здесь появятся отзывы путешественников.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
        {reviews.map((review) => (
          <Review review={review} key={review._id} />
        ))}
      </div>
    );
  };

  const renderRating = (centered = false) => {
    return (
      <div className={cn(
        "flex flex-wrap gap-1 items-center text-sm sm:text-base",
        centered ? "justify-center lg:justify-start" : "justify-start"
      )}>
        <Star className="stroke-2 size-4 sm:size-5 fill-yellow-400 text-yellow-400" />
        <span className="text-[var(--primary)] font-bold">
          {tour.rating > 0 ? tour.rating : 'нет оценок :('}
        </span>
        <Dot className="stroke-1 size-4 text-gray-400" />
        <div className="font-semibold flex gap-1 text-gray-600">
          {tour.ratingCount > 0 ? tour.ratingCount : 'нет'}
          <span className="font-normal">
            {pluralize(tour.ratingCount, 'отзыв', 'отзыва', 'отзывов')}
          </span>
        </div>
      </div>
    );
  };

  const renderPrice = () => {
    const defaultPriceJSX = <p>{defaultPriceInfo.price}</p>;

    if (discountPriceInfo) {
      return (
        <div className="flex flex-col items-start w-full">
          <div className="text-gray-400 text-xs inline-flex flex-row gap-1 items-center">
            <div className="line-through">{defaultPriceJSX}</div>
            <p className="lowercase text-gray-400 text-xs">
              {defaultPriceInfo.currency}
            </p>
          </div>
          <div className="text-2xl sm:text-3xl text-white font-bold mt-0.5">
            <span className="text-green-400">{discountPriceInfo.price} </span>
            <span className="text-sm font-normal text-gray-300">
              {discountPriceInfo.currency}
            </span>
          </div>
          <div className="bg-red-500 text-white rounded-xl px-3 py-1 mt-3 flex flex-wrap gap-1 text-xs font-semibold items-center shadow-sm">
            <BadgePercent className="size-3.5 stroke-[2.5]" />
            <span>Скидка до</span>
            <span>{saleDeadlineDay}</span>
            <span>{saleDeadlineMonth}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="text-2xl sm:text-3xl text-white font-bold">
        <span>{defaultPriceInfo.price} </span>
        <span className="text-base font-normal text-gray-400">
          {defaultPriceInfo.currency}
        </span>
      </div>
    );
  };

  return (
    <>
      {selectedTourSet._id && (
        <OrderCard
          key={selectedTourSet._id}
          isOpen={isOrderOpen}
          onClose={closeModalOrder}
          tourSetId={selectedTourSet._id}
          tourTitle={tour.title}
          startDate={selectedTourSet.startDate}
          endDate={selectedTourSet.endDate}
          price={selectedTourSet.discountPrice ?? selectedTourSet.price}
        />
      )}

      <div>
        <section aria-labelledby="tour-title" className="mt-6 sm:mt-10">
          <Breadcrumbs
            items={[
              { label: 'Туры', href: '/tours' },
              {
                label: tour.category.title,
                href: `/tours?category=${tour.category._id}`,
              },
              { label: tour.title },
            ]}
            className="mb-6 sm:mb-10 text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-none"
          />

          <div className="relative rounded-2xl overflow-hidden">
            <div className="flex flex-wrap gap-2 absolute z-10 top-3 left-3 text-[10px] sm:text-xs">
              {selectedTourSet.isHot && (
                <p className="flex gap-1 bg-red-500 text-red-50 border border-red-500 rounded-full uppercase font-bold px-3 py-1.5 items-center backdrop-blur-md bg-opacity-90 shadow-sm">
                  <Flame className="size-3.5 stroke-[2.5]" />
                  Горящий
                </p>
              )}
              <p className="flex gap-2 bg-white/90 text-slate-700 border border-slate-200 rounded-full uppercase font-bold px-3 py-1.5 backdrop-blur-md shadow-sm">
                {tour.category.title}
              </p>
            </div>
            <TourGallery images={tour.images} title={tour.title} />
          </div>

          <header className="mt-5 sm:mt-7">
            <h1
              id="tour-title"
              className="text-[var(--primary)] font-bold text-xl sm:text-2xl md:text-[1.8rem] leading-tight"
            >
              {tour.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 gap-2 sm:gap-6 text-xs sm:text-sm mt-3 border-b border-slate-100 pb-4">
              <div className="flex gap-1.5 items-center">
                <MapPin className="stroke-2 size-4 text-gray-400" />
                <span className="font-medium text-gray-600">{selectedTourSet.hotelLocation}</span>
              </div>
              {renderRating()}
            </div>
          </header>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mt-6 mb-10 items-start">

          <div className="flex flex-col gap-8 lg:col-start-1">
            <section aria-labelledby="description-title">
              <h2 id="description-title" className="font-bold text-lg sm:text-[1.3rem] text-[var(--primary)]">
                Описание
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">{tour.description}</p>
            </section>

            <section aria-labelledby="logistics-title">
              <h2 id="logistics-title" className="sr-only">Логистика</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: <Clock3 className="size-4" />, label: "Длительность", value: `${days} дней` },
                  { icon: <Plane className="size-4" />, label: "Перелёт", value: "Включён" },
                  { icon: <MapPin className="size-4" />, label: "Направление", value: tour.category.title },
                  { icon: <CalendarHeart className="size-4" />, label: "Заездов", value: `${activeSetsCount} ${pluralize(activeSetsCount, 'дата', 'даты', 'дат')}` }
                ].map((item, i) => (
                  <article key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4 flex flex-col justify-between min-h-[100px]">
                    <span className="mb-2 inline-flex size-8 items-center justify-center rounded-lg bg-[var(--navy-700)] text-cyan-400 shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{item.label}</p>
                      <p className="mt-0.5 font-bold text-xs sm:text-sm text-[var(--primary)] truncate">{item.value}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="advantages-title">
              <h2 id="advantages-title" className="font-bold text-lg sm:text-[1.3rem] text-[var(--primary)]">
                Преимущества тура
              </h2>
              <ul className="flex flex-wrap gap-2 mt-4">
                {tour.baseAdvantages.map((advantage, index) => (
                  <li
                    key={advantage + index}
                    className="inline-flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm text-xs sm:text-sm"
                  >
                    <span className="advantage-check inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-3 stroke-[3]" />
                    </span>
                    <span className="font-medium text-slate-700">{advantage}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="where-to-go-title" className="border-t border-slate-100 pt-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 id="where-to-go-title" className="font-bold text-lg sm:text-[1.3rem] text-[var(--primary)]">
                  Когда поехать
                </h2>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full sm:w-64"
                />
              </div>

              <div className="flex flex-col gap-4">
                {dateRange?.from && visibleTours?.length === 0 &&
                  <span className="text-sm text-muted-foreground text-center bg-slate-50 p-6 rounded-xl border border-dashed">Заездов на эту дату не найдено</span>
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
          </div>

          <aside aria-labelledby="booking-title" className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-6 w-full">
            <div className="border border-slate-100 rounded-2xl text-[var(--navy-700)] shadow-sm bg-white overflow-hidden relative">
              {selectedTourSet.isHot && (
                <div className="absolute top-3 right-3 text-[10px] py-1 px-2.5 uppercase text-red-50 bg-red-500 flex items-center gap-1 rounded-lg font-bold tracking-wider shadow-sm">
                  <Flame className="size-3.5 stroke-[2.5]" />
                  <span>горящий</span>
                </div>
              )}

              <div className="bg-[var(--navy-700)] p-4 sm:p-5">
                <div className="text-cyan-400 inline-flex items-center text-xs font-bold uppercase tracking-wider mb-1">
                  <Dot className="size-6 -ml-2 text-cyan-400 animate-pulse" />
                  <h2 id="booking-title">Выбранный заезд</h2>
                </div>
                {renderPrice()}
              </div>

              <div className="p-4 sm:p-5">
                <dl className="flex flex-col gap-4 text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-4 py-1 border-b border-slate-50">
                    <dt className="text-muted-foreground inline-flex gap-2 items-center shrink-0">
                      <Calendar1 className="stroke-[1.5] size-4 text-slate-400" />
                      <span>Даты</span>
                    </dt>
                    <dd className="font-bold text-slate-800 text-right flex flex-wrap gap-1 justify-end">
                      <span>{startDay} {startMonth}</span>
                      <span className="text-slate-400 mx-0.5">—</span>
                      <span>{endDay} {endMonth}</span>
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1 border-b border-slate-50">
                    <dt className="text-muted-foreground inline-flex gap-2 items-center shrink-0">
                      <Clock3 className="stroke-[1.5] size-4 text-slate-400" />
                      <span>Длительность</span>
                    </dt>
                    <dd className="font-bold text-slate-800 text-right">
                      {days} дн. / {nights} ноч.
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-1 border-b border-slate-50">
                    <dt className="text-muted-foreground inline-flex gap-2 items-center shrink-0">
                      <UsersRound className="stroke-[1.5] size-4 text-slate-400" />
                      <span>Свободно</span>
                    </dt>
                    <dd className="font-bold text-amber-600 text-right">
                      <SeatsIndicator
                        free={freeSeats}
                        total={selectedTourSet.totalSeats}
                      />
                    </dd>
                  </div>

                  <div className="flex items-start justify-between gap-4 py-1 border-b border-slate-50">
                    <dt className="text-muted-foreground inline-flex gap-2 items-center shrink-0 mt-0.5">
                      <Hotel className="stroke-[1.5] size-4 text-slate-400" />
                      <span>Отель</span>
                    </dt>
                    <dd className="font-bold text-slate-800 text-right max-w-[60%]">
                      <span className="block truncate">{selectedTourSet.hotelName}</span>
                      <span className="block font-normal text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {selectedTourSet.hotelLocation}
                      </span>
                    </dd>
                  </div>

                  <div className="flex items-start justify-between gap-4 py-1">
                    <dt className="text-muted-foreground inline-flex gap-2 items-center shrink-0 mt-0.5">
                      <Plane className="stroke-[1.5] size-4 text-slate-400" />
                      <span>Перелёт</span>
                    </dt>
                    <dd className="font-bold text-slate-800 text-right max-w-[60%]">
                      <span className="block truncate">{selectedTourSet.airline}</span>
                      <span className="block font-normal text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {selectedTourSet.flightDetails}
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex gap-2.5 flex-col">
                  <button
                    type="button"
                    aria-label="Оставить заявку"
                    onClick={() => openModalOrder()}
                    className="w-full cursor-pointer bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl py-3.5 font-bold transition inline-flex items-center gap-3 justify-center text-sm shadow-sm active:scale-[0.99]"
                  >
                    <Send className="text-cyan-400 size-4.5 stroke-[2.5]" />
                    <span>Оставить заявку</span>
                  </button>
                  <button
                    className="flex gap-2.5 justify-center items-center text-center w-full cursor-pointer text-slate-700 bg-white border border-slate-200 rounded-xl py-2.5 font-bold transition hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-sm active:scale-[0.99]"
                    onClick={handleWhatsAppClick}
                    type="button"
                    aria-label="Связаться через WhatsApp"
                  >
                    <FaWhatsapp className="size-5 text-emerald-500 transition-colors current-color" />
                    <span>Написать в WhatsApp</span>
                  </button>
                </div>
                <p className="text-xs mt-4 flex gap-2 items-center justify-center text-gray-400 font-medium">
                  <ShieldCog className="size-4 text-slate-400" />
                  <span>С вами свяжутся in течение часа</span>
                </p>
              </div>
            </div>
          </aside>

          <section className="border-t border-slate-100 pt-8 lg:col-start-1">
            <div className="max-w-2xl mx-auto lg:mx-0 w-full">
              <CreateReviewForm tourId={id} />

              <div className="flex flex-col items-center lg:items-start border-t border-slate-100 pt-6 mt-8 text-center lg:text-left gap-2">
                <h2 id="reviews-title" className="font-bold text-lg sm:text-[1.3rem] text-[var(--primary)]">
                  Отзывы путешественников
                </h2>
                {renderRating(true)}
              </div>

              <div className="mt-6 w-full">{renderReviews()}</div>

              {hasNextPage && (
                <button
                  type="button"
                  aria-label="загрузить еще отзывов"
                  className="text-center text-xs sm:text-sm border border-slate-200 bg-white rounded-xl p-3 mt-5 w-full font-bold cursor-pointer transition hover:bg-slate-50 active:scale-[0.99]"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? <Spinner /> : `Загрузить еще`}
                </button>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default TourDetailView;