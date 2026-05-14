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

const days = Math.max(
    1,
    Math.ceil(
     (new Date(set.endDate).getTime() - new Date(set.startDate).getTime()) /
       (1000 * 3600 * 24),
    )
  )
  const nights = Math.max(days - 1, 0);
  const seatsLeft = Math.max(set.totalSeats - set.bookedSeats, 0);

  const savings = set.price - (set.discountPrice ? set.discountPrice : 0);

  return (
    <div className="max-w-7xl mx-auto py-10 text-zinc-100">
      {data._id && (
        <OrderCard
          isOpen={isOrderOpen}
          onClose={closeModalOrder}
          tourSetId={data._id}
        />
      )}

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
                  {days} дн. / {nights - 1} ноч.
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-500">
                  <span>Даты:</span>
                </div>
                <span className="font-bold">
                  {new Date(data.startDate).toLocaleDateString('ru-RU')}
                  <span className="text-zinc-400 font-medium">{' по '}</span>
                  {new Date(data.endDate).toLocaleDateString('ru-RU')}
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
              className="w-full mb-3 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors active:scale-95 shadow-xl"
            >
              Оставить заявку
            </button>

            <button
              onClick={() => {
                const phoneNumber = '550176420';
                const message = `Здравствуйте! Меня интересует ${data.tourId.title || 'тур'}, начиная с ${data.startDate}. Не могли бы вы предоставить более подробную информацию?`;
                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

                window.open(url, '_blank');
              }}
              className="w-full py-5 flex items-center justify-center gap-3 text-sm text-white bg-[#25D366] rounded-2xl font-black uppercase tracking-widest hover:bg-[#20ba5a] transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(37,211,102,0.39)]"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.415 0 12.05c0 2.122.554 4.197 1.607 6.013L0 24l6.135-1.61a11.75 11.75 0 005.914 1.586h.005c6.637 0 12.05-5.415 12.05-12.05a11.852 11.852 0 00-3.41-8.523z" />
              </svg>
              Связаться через WhatsApp
            </button>

            <a
              href=""
              className="text-center mt-4 text-xs text-zinc-400 font-medium"
            >
              С вами свяжутся как только оставите заявку
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
