'use client';

import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Hotel,
    Plane,
    Users,
} from 'lucide-react';

import TourGallery from '@/components/tourGallery/TourGallery';
import { Badge } from '@/components/ui/badge';
import { useOneTourSet } from '@/lib/hooks/tourSets';
import TourSetReviewsManager from '@/components/dashboard/tourSets/TourSetReviewsManager';

const formatDate = (date?: string) => {
    if (!date) {
        return 'Дата не указана';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Дата не указана';
    }

    return parsedDate.toLocaleDateString('ru-RU', {
        timeZone: 'UTC',
    });
};

const formatPrice = (price?: number) => {
    if (typeof price !== 'number') {
        return 'Цена не указана';
    }

    return `${price.toLocaleString('ru-RU')} сом`;
};

const getSaleDeadlineText = (saleDeadline?: string) => {
    if (!saleDeadline) {
        return 'Дедлайн не указан';
    }

    const deadline = new Date(saleDeadline);

    if (Number.isNaN(deadline.getTime())) {
        return 'Дедлайн не указан';
    }

    const difference = deadline.getTime() - Date.now();

    if (difference <= 0) {
        return 'Скидка завершена';
    }

    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3) {
        return `Скоро закончится: ${daysLeft} дн.`;
    }

    return `До ${formatDate(saleDeadline)}`;
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'OPEN':
            return 'Открыт';
        case 'CLOSED':
            return 'Мест нет';
        case 'FINISHED':
            return 'Завершён';
        default:
            return status;
    }
};

const getStatusClassName = (status: string) => {
    switch (status) {
        case 'OPEN':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'CLOSED':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'FINISHED':
            return 'border-gray-200 bg-gray-100 text-gray-600';
        default:
            return 'border-gray-200 bg-gray-50 text-gray-600';
    }
};

const TourSetDetailsPage = () => {
    const router = useRouter();
    const params = useParams();

    const groupId = params.groupID as string;

    const { data: tourSet, isLoading, isError } = useOneTourSet(groupId);

    if (isLoading) {
        return (
            <main className="p-8 text-center text-gray-500">
                Загрузка данных потока...
            </main>
        );
    }

    if (isError || !tourSet) {
        return (
            <main className="p-8 text-center text-red-500">
                Поток тура не найден
            </main>
        );
    }

    const tour = tourSet.tourId;
    const seatsLeft = Math.max(tourSet.totalSeats - tourSet.bookedSeats, 0);

    const hasDiscount =
        typeof tourSet.discountPrice === 'number' &&
        tourSet.discountPrice < tourSet.price;

    const currentPrice = hasDiscount ? tourSet.discountPrice : tourSet.price;
    const savings = hasDiscount ? tourSet.price - tourSet.discountPrice! : 0;

    const days = Math.max(
        1,
        Math.ceil(
            (new Date(tourSet.endDate).getTime() -
                new Date(tourSet.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
    );

    const nights = Math.max(days - 1, 0);

    const seatsBadgeClass =
        seatsLeft === 0
            ? 'border-red-200 bg-red-50 text-red-700'
            : seatsLeft < 5
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700';

    const seatsText =
        seatsLeft === 0
            ? 'Мест нет'
            : seatsLeft < 5
                ? 'Мест почти не осталось'
                : 'Места доступны';

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 transition hover:text-[#1E2B6D]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Назад
                    </button>

                    <span className="text-xs font-mono text-gray-400">
            TourSet ID: {tourSet._id}
          </span>
                </header>

                <section aria-label="Основная информация о потоке">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full bg-[#1E2B6D] px-3 py-1 text-white">
                            {tour.category?.title || 'Категория не указана'}
                        </Badge>

                        <Badge
                            variant="outline"
                            className={getStatusClassName(tourSet.status)}
                        >
                            {getStatusText(tourSet.status)}
                        </Badge>

                        {tourSet.isHot && (
                            <Badge className="rounded-full bg-red-500 px-3 py-1 text-white">
                                HOT
                            </Badge>
                        )}

                        <Badge variant="outline" className={seatsBadgeClass}>
                            {seatsText}
                        </Badge>
                    </div>

                    <h1 className="text-4xl font-black tracking-tight text-[#1E2B6D]">
                        {tour.title}
                    </h1>

                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
                        {tour.description}
                    </p>
                </section>

                <section aria-label="Галерея тура" className="rounded-3xl bg-white p-4 shadow-sm">
                    <TourGallery images={tour.images} title={tour.title} />
                </section>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <article className="space-y-6">
                        <section className="rounded-3xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-black text-[#1E2B6D]">
                                Преимущества тура
                            </h2>

                            {tour.baseAdvantages.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {tour.baseAdvantages.map((advantage) => (
                                        <div
                                            key={advantage}
                                            className="flex items-center gap-3 rounded-2xl border border-gray-100 p-4"
                                        >
                                            <CheckCircle
                                                className="shrink-0 text-emerald-500"
                                                size={20}
                                            />

                                            <span className="text-sm font-medium text-gray-700">
                        {advantage}
                      </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Преимущества пока не указаны.
                                </p>
                            )}
                        </section>

                        <section className="rounded-3xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-black text-[#1E2B6D]">
                                Детали потока
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2">
                                <article className="rounded-2xl border border-gray-100 p-5">
                                    <div className="mb-3 flex items-center gap-2 text-[#1E2B6D]">
                                        <Hotel size={20} />
                                        <h3 className="font-bold uppercase">Отель</h3>
                                    </div>

                                    <p className="text-lg font-black text-gray-900">
                                        {tourSet.hotelName || 'Отель не указан'}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {tourSet.hotelLocation || 'Локация не указана'}
                                    </p>
                                </article>

                                <article className="rounded-2xl border border-gray-100 p-5">
                                    <div className="mb-3 flex items-center gap-2 text-[#1E2B6D]">
                                        <Plane size={20} />
                                        <h3 className="font-bold uppercase">Перелёт</h3>
                                    </div>

                                    <p className="text-lg font-black text-gray-900">
                                        {tourSet.airline || 'Авиакомпания не указана'}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {tourSet.flightDetails || 'Детали перелёта не указаны'}
                                    </p>
                                </article>
                            </div>
                        </section>
                        <TourSetReviewsManager tourId={tour._id} />
                    </article>

                    <aside className="h-fit rounded-3xl bg-white p-6 shadow-xl lg:sticky lg:top-8">
                        <section aria-label="Стоимость потока">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Стоимость
                            </p>

                            <div className="mt-3">
                                <p className="text-4xl font-black text-[#1E2B6D]">
                                    {formatPrice(currentPrice)}
                                </p>

                                {hasDiscount && (
                                    <p className="mt-1 text-lg font-bold text-gray-400 line-through">
                                        {formatPrice(tourSet.price)}
                                    </p>
                                )}

                                {hasDiscount && (
                                    <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                                        Выгода {formatPrice(savings)}
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="my-6 space-y-4 border-y border-gray-100 py-6">
                            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-500">
                  <Calendar size={18} />
                  Даты
                </span>

                                <span className="text-right text-sm font-bold text-gray-900">
                  {formatDate(tourSet.startDate)} — {formatDate(tourSet.endDate)}
                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-500">
                  <Clock size={18} />
                  Длительность
                </span>

                                <span className="text-sm font-bold text-gray-900">
                  {days} дн. / {nights} ноч.
                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-gray-500">
                  <Users size={18} />
                  Места
                </span>

                                <span className="text-sm font-bold text-gray-900">
                  {seatsLeft} из {tourSet.totalSeats}
                </span>
                            </div>

                            <div className="rounded-2xl bg-[#F7F8F4] p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Дедлайн продаж
                                </p>

                                <p className="mt-1 font-black text-[#1E2B6D]">
                                    {getSaleDeadlineText(tourSet.saleDeadline)}
                                </p>
                            </div>
                        </section>

                        <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-500">
                            Эта страница доступна для администратора и менеджера через
                            dashboard.
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default TourSetDetailsPage;