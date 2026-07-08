import { Badge } from '@/components/ui/badge';
import BasePhoto from '@/components/assets/lake.webp';
import { Card } from '@/components/ui/card';
import type { TourType } from '@/types/tour';
import { imageUrl, isDev } from '@/lib/constants';
import Image from 'next/image';

interface Props {
  tour: TourType;
}

export function TourCard({ tour }: Props) {
  const image =
    tour.images.length > 0 ? imageUrl + tour.images[0] : BasePhoto.src;

  return (
    <Card className="group relative mx-auto h-[420px] w-full overflow-hidden rounded-3xl border-0 bg-black text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
      <Image
        src={image}
        alt={tour.title ?? 'Фото тура'}
        fill
        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
        unoptimized={isDev}
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="relative z-20 flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <Badge className="rounded-full bg-white/20 px-4 py-1 text-white backdrop-blur text-lg">
            {tour.category.title}
          </Badge>

          <div className="rounded-2xl bg-black/40 px-4 py-2 backdrop-blur">
            <p className="text-xs text-zinc-300">от</p>
            <p className="text-2xl font-bold">$790</p>
          </div>
        </div>

        <div>
          <div className="mb-5">
            <h2 className="text-xl md:text-2xl font-black leading-none">
              {tour.title}
            </h2>

            <p className="mt-3 text-zinc-300">{tour.description}</p>
          </div>

          <div className="mb-6 flex gap-2">
            {tour.baseAdvantages.map((advantage) => (
              <div
                key={advantage}
                className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur"
              >
                {advantage}
              </div>
            ))}
          </div>
          {/*
          <Button
            onClick={() =>

            }
            className="h-14 w-full rounded-2xl bg-white text-lg font-bold text-black hover:bg-zinc-200"
          >
            Оставить заявку
          </Button> */}
        </div>
      </div>
    </Card>
  );
}
