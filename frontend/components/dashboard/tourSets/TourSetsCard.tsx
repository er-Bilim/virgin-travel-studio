'use client';

import BasePhoto from '@/components/assets/lake.webp';
import { Card } from '@/components/ui/card';
import type { TourSetType } from '@/types/tourSets';
import { imageUrl } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props {
  tourSet: TourSetType;
  openModal: (id: string) => void;
}

export function TourSetsCard({ tourSet, openModal }: Props) {
  const image =
    tourSet.tourId.images.length > 0
      ? imageUrl + tourSet.tourId.images[0]
      : BasePhoto.src;
  const startDate = new Date(tourSet.startDate).toLocaleDateString('ru-RU');
  const endDate = new Date(tourSet.endDate).toLocaleDateString('ru-RU');
  const price = `${tourSet.price} сом`;
  const freeSeets = tourSet.totalSeats - tourSet.bookedSeats;

  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/tourSets/${tourSet._id}`)}
      className="group relative mx-auto h-[420px] w-full overflow-hidden rounded-3xl border-0 bg-black text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]"
    >
      <img
        src={image}
        alt="tour"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="relative z-20 flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <div className="rounded-2xl bg-black/40 px-4 py-2 backdrop-blur">
            <p className="text-xs text-zinc-300">от</p>
            <p className="text-2xl font-bold">{price}</p>
          </div>
          <div className="rounded-2xl bg-black/40 px-4 py-2 backdrop-blur">
            <p className="text-xs text-zinc-300">осталось мест</p>
            <p className="text-lg font-bold">{freeSeets}</p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-6">
            {tourSet.isHot && (
              <span className="inline-block px-2 py-0.5 mb-2 text-xs font-bold uppercase tracking-wider text-black bg-yellow-400 rounded">
                Hot
              </span>
            )}

            <h2 className="text-2xl md:text-3xl font-black leading-tight text-white">
              {tourSet.tourId.title}
            </h2>

            <div className="mt-3 flex items-center gap-2 text-zinc-200 text-sm md:text-base">
              <svg
                className="w-4 h-4 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {startDate} — {endDate}
              </span>
            </div>
          </div>

          <div className="mb-6 flex gap-2">
            {tourSet.tourId.baseAdvantages.map((advantage) => (
              <div
                key={advantage}
                className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur"
              >
                {advantage}
              </div>
            ))}
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              openModal(tourSet._id)
            }}
            className="py-4 self-end rounded-xl bg-white text-xs font-bold text-black hover:bg-zinc-200"
          >
            Оставить заявку
          </Button>
        </div>
      </div>
    </Card>
  );
}
