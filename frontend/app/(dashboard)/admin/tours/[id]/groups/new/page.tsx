'use client';

import { useParams } from 'next/navigation';
import { TourSetForm } from '@/components/dashboard/tourSets/TourSetForm';

export default function NewTourGroupPage() {
  const params = useParams();
  const tourId = params.id as string;

  if (!tourId) {
    return (
      <div className="p-6 text-red-500 font-semibold">
        Ошибка: Идентификатор тура не найден в URL.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#1E2B6D]">
          Добавление новой группы тура
        </h1>
        <TourSetForm parentTourId={tourId} />
      </div>
    </div>
  );
}
