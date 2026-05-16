'use client';

import {useState} from 'react';
import {useParams} from 'next/navigation';
import {
    Calendar,
    CheckCircle,
    Clock,
    Hotel,
    Plane,
    Users,
} from 'lucide-react';

import {OrderCard} from '@/components/dashboard/orders/OrderCard';
import CountdownTimer from '@/components/public/tours/CountdownTimer';
import TourGallery from '@/components/tourGallery/TourGallery';
import {useOneTourSet} from '@/lib/hooks/tourSets';

const TourSetDetailPage = () => {
    const params = useParams();
    const id = params.id as string;

    const {data, isLoading, isError} = useOneTourSet(id);
    const [isOrderOpen, setIsOrderOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="py-20 text-center text-lg font-semibold">
                Загрузка потока...
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="py-20 text-center text-lg font-semibold text-red-500">
                Не удалось загрузить поток тура
            </div>
        );
    }

    const {tourId} = data;

    const days = Math.max(
        1,
        Math.ceil(
            (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
    );

    const nights = Math.max(days - 1, 0);
    const seatsLeft = Math.max(data.totalSeats - data.bookedSeats, 0);
    const actualPrice = data.discountPrice || data.price;
    const saving = data.discountPrice ? data.price - data.discountPrice : 0;

    return (
        <section className="py-10">
            <OrderCard
                isOpen={isOrderOpen}
                onClose={() => setIsOrderOpen(false)}
                tourSetId={data._id}
            />

            <div className="mb-10">
                <TourGallery images={tourId.images} title={tourId.title}/>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
                <div className="space-y-10">
                    <div>
                        <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#1E2B6D] px-4 py-2 text-xs font-bold uppercase text-white">
                {tourId.category.title}
              </span>

                            {data.isHot && (
                                <span
                                    className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase text-white">
                  HOT
                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-black text-[#1E2B6D] md:text-5xl">
                            {tourId.title}
                        </h1>

                        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">
                            {tourId.description}
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {tourId.baseAdvantages.map((advantage) => (
                            <div
                                key={advantage}
                                className="flex items-center gap-3 rounded-3xl bg-white p-5 shadow-sm"
                            >
                                <CheckCircle className="text-[#39C6C5]" size={22}/>
                                <span className="font-medium text-[#1E2B6D]">
                  {advantage}
                </span>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-3xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 text-[#1E2B6D]">
                                <Hotel size={22}/>
                                <h2 className="font-bold uppercase">
                                    Отель
                                </h2>
                            </div>

                            <p className="text-xl font-black text-[#1E2B6D]">
                                {data.hotelName}
                            </p>

                            <p className="mt-2 text-gray-500">
                                {data.hotelLocation}
                            </p>
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2 text-[#1E2B6D]">
                                <Plane size={22}/>
                                <h2 className="font-bold uppercase">
                                    Перелёт
                                </h2>
                            </div>

                            <p className="text-xl font-black text-[#1E2B6D]">
                                {data.airline}
                            </p>

                            <p className="mt-2 text-gray-500">
                                {data.flightDetails}
                            </p>
                        </div>
                    </div>
                </div>

                <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-xl lg:sticky lg:top-28">
                    <div className="mb-6">
                        <p className="text-sm font-bold uppercase text-gray-400">
                            Стоимость
                        </p>

                        <div className="mt-2 flex items-end gap-3">
                            <p className="text-4xl font-black text-[#1E2B6D]">
                                {actualPrice} сом
                            </p>

                            {data.discountPrice && (
                                <p className="text-lg font-semibold text-gray-400 line-through">
                                    {data.price} сом
                                </p>
                            )}
                        </div>

                        {saving > 0 && (
                            <p className="mt-2 font-semibold text-green-600">
                                Выгода {saving} сом
                            </p>
                        )}
                    </div>

                    <div className="space-y-4 border-y border-gray-100 py-6">
                        <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-gray-500">
                <Calendar size={18}/>
                Даты
              </span>

                            <span className="text-right font-bold text-[#1E2B6D]">
                {new Date(data.startDate).toLocaleDateString('ru-RU')} —{' '}
                                {new Date(data.endDate).toLocaleDateString('ru-RU')}
              </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-gray-500">
                <Clock size={18}/>
                Длительность
              </span>

                            <span className="font-bold text-[#1E2B6D]">
                {days} дн. / {nights} ноч.
              </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-gray-500">
                <Users size={18}/>
                Уже присоединились
              </span>

                            <span className="font-bold text-[#1E2B6D]">
                {data.bookedSeats} человек
              </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">
                Свободно мест
              </span>

                            <span className={seatsLeft < 5 ? 'font-bold text-red-500' : 'font-bold text-[#1E2B6D]'}>
                {seatsLeft} из {data.totalSeats}
              </span>
                        </div>

                        <div className="rounded-2xl bg-[#1E2B6D] p-4 text-white">
                            <p className="text-sm text-white/70">
                                До конца акции
                            </p>

                            <CountdownTimer saleDeadline={data.saleDeadline}/>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOrderOpen(true)}
                        className="mt-6 w-full rounded-2xl bg-[#1E2B6D] px-5 py-5 text-sm font-black uppercase tracking-widest text-white transition hover:bg-[#176C99]"
                    >
                        Оставить заявку
                    </button>

                    <p className="mt-4 text-center text-xs text-gray-400">
                        Менеджер свяжется с вами после отправки заявки.
                    </p>
                </aside>
            </div>
        </section>
    );
};

export default TourSetDetailPage;