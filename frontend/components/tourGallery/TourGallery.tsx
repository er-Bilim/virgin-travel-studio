'use client';

import { useState } from 'react';
import Image from 'next/image';
import { imageUrl } from '@/lib/constants';

interface Props {
    images: string[];
    title: string;
}

export default function TourGallery({ images, title }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8">

      <div className="relative aspect-[16/8] md:aspect-[21/9] w-full overflow-hidden rounded-[2.5rem] border border-zinc-800 shadow-2xl bg-zinc-900 transition-all duration-500">
        <Image
          src={`${imageUrl + images[activeIdx]}`}
          alt={title}
          fill
          unoptimized 
          priority 
          className="object-cover transition-opacity duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-8 left-8">
          <h1 className="text-3xl md:text-2xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg">
            {title}
          </h1>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {images.map((path, index) => (
          <button
            key={index}
            onClick={() => setActiveIdx(index)}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all 
              ${
                activeIdx === index
                  ? 'border-yellow-400 scale-95 ring-2 ring-yellow-400/20'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
              }`}
          >
            <Image
              src={`${imageUrl + path}`}
              alt={`Thumbnail ${index}`}
              fill
              unoptimized
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
