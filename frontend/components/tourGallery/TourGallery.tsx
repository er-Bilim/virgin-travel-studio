'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { imageUrl, isDev } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  title: string;
}

export default function TourGallery({ images, title }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images?.length) {
    return (
      <div className="w-full aspect-[21/9] rounded-3xl bg-muted flex items-center justify-center">
        <ImageOff className="size-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <div className="relative aspect-[4/3] md:aspect-[21/9] w-full overflow-hidden rounded-3xl">
        <Image
          src={imageUrl + images[activeIdx]}
          alt={`${title} — фото ${activeIdx + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 1440px"
          priority={activeIdx === 0}
          className="object-cover"
          unoptimized={isDev}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((path, index) => (
            <button
              type="button"
              key={path}
              onClick={() => setActiveIdx(index)}
              aria-label={`Фото ${index + 1} из ${images.length}`}
              aria-current={activeIdx === index ? 'true' : undefined}
              className={cn(
                'relative w-36 h-25 overflow-hidden rounded-lg border-1 transition-all cursor-pointer',
                activeIdx === index
                  ? 'border-primary'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105',
              )}
            >
              <Image
                src={imageUrl + path}
                alt={`${title} — фото ${activeIdx + 1}`}
                fill
                unoptimized={isDev}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
