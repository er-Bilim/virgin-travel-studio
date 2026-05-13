'use client';

import { useParams } from 'next/navigation';
import { useOneTourSet } from '@/lib/hooks/tourSets';
import TourGallery from '@/components/tourGallery/TourGallery';
import {
  Calendar,
  Hotel,
  Plane,
  CheckCircle,
  Users,
  Clock,
} from 'lucide-react';
import { OrderCard } from '@/components/dashboard/orders/OrderCard';
import { useState } from 'react';

export default function TourSetPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, isError } = useOneTourSet(slug);

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

  const { tourId, ...set } = data;

  const nights = Math.ceil(
    (new Date(set.endDate).getTime() - new Date(set.startDate).getTime()) /
      (1000 * 3600 * 24),
  );
  const seatsLeft = set.totalSeats - set.bookedSeats;
  const savings = set.price - set.discountPrice;

  return (
    <div className="max-w-7xl mx-auto py-10 text-zinc-100">
      <OrderCard
        isOpen={isOrderOpen}
        onClose={closeModalOrder}
        tourSetId={data._id}
      />
      <div className="mb-12">
        <TourGallery images={tourId.images} title={tourId.title} />
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold uppercase rounded-full">
                {tourId.category.title}
              </span>
              {set.isHot && (
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-full animate-pulse">
                  Hot
                </span>
              )}
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-black text-sky-900 uppercase tracking-tighter mb-6">
              {tourId.title}
            </h1>
            <p className="text-zinc-700 text-lg leading-relaxed max-w-2xl">
              {tourId.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tourId.baseAdvantages.map((adv, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl"
              >
                <CheckCircle className="text-yellow-400 shrink-0" size={20} />
                <span className="text-sm font-medium">{adv}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Hotel size={20} />
                <h3 className="font-bold uppercase tracking-widest text-xs">
                  Проживание
                </h3>
              </div>
              <div className="p-6 bg-zinc-900 rounded-[2rem] border border-zinc-800">
                <p className="text-xl font-bold mb-1">{set.hotelName}</p>
                <p className="text-zinc-500 text-sm">{set.hotelLocation}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Plane size={20} />
                <h3 className="font-bold uppercase tracking-widest text-xs">
                  Перелет
                </h3>
              </div>
              <div className="p-6 bg-zinc-900 rounded-[2rem] border border-zinc-800">
                <p className="text-xl font-bold mb-1">{set.airline}</p>
                <p className="text-zinc-500 text-sm">{set.flightDetails}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[400px]">
          <div className="sticky top-10 p-4 sm:p-6 md:p-8 bg-white text-black rounded-[1rem] sm:rounded-[3rem] shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-tighter">
                  Стоимость
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-4xl font-black">
                    {set.discountPrice} с
                  </span>
                  <span className="text-lg text-zinc-400 line-through">
                    {set.price} с
                  </span>
                </div>
              </div>
              {savings > 0 && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-sm">
                  -{savings} сом
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar size={18} /> <span>Длительность</span>
                </div>
                <span className="font-bold">
                  {nights} дн. / {nights - 1} ноч.
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Users size={18} /> <span>Свободно мест</span>
                </div>
                <span
                  className={`font-bold ${seatsLeft < 5 ? 'text-red-600' : ''}`}
                >
                  {seatsLeft} из {set.totalSeats}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Clock size={18} /> <span>Дедлайн скидки</span>
                </div>
                <span className="font-bold text-sm italic">
                  {new Date(set.saleDeadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => openModalOrder()}
              className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors active:scale-95 shadow-xl"
            >
              Оставить заявку
            </button>

            <p className="text-center mt-4 text-xs text-zinc-400 font-medium">
              С вами свяжутся как только оставите заявку
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
