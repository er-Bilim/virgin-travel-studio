import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import type { TourType } from '@/types/tour';
import { apiURL, isDev } from '@/lib/constants';
import Image from 'next/image';

type TourImageCellProps = {
  tour: TourType;
};

export const TourImageCell = ({ tour }: TourImageCellProps) => {
  const validImages = tour.images.filter((img): img is string => img !== null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  if (validImages.length === 0) {
    return (
      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-400">
        Нет фото
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="w-fit inline-block">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm"
          >
            Посмотреть
          </button>
        </DialogTrigger>

            <DialogContent className="max-w-4xl flex flex-col items-center">
                <DialogHeader>
                    <DialogTitle className="sr-only">
                        Просмотр изображения
                    </DialogTitle>
                </DialogHeader>
              <DialogDescription className="sr-only">
                Изображение тура
              </DialogDescription>

          <div className="relative flex h-[20vh] w-full items-center justify-center">
            <Image
              src={apiURL + '/tours/image/' + validImages[currentIndex]}
              alt={tour.title}
              fill
              sizes="(min-width: 1024px) 896px, 100vw"
              unoptimized={isDev}
              className="rounded-xl object-contain"
            />
          </div>

          {validImages.length > 1 && (
            <div className="flex items-center gap-4 mt-4">
              <button onClick={prevImage}>←</button>

              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {validImages.length}
              </span>

              <button onClick={nextImage}>→</button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
