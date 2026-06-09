'use client';

import { useParams } from 'next/navigation';
import { useTourById } from '@/lib/hooks/tourHooks';
import { TourForm } from '@/components/dashboard/tours/TourForm';

export default function EditTour() {
  const params = useParams();
  const id = params.id as string;

  const { data: tour, isLoading, isError } = useTourById(id);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#031633] font-medium">
        Загрузка данных тура...
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Тур не найден</h2>
        <p className="text-gray-500">
          Возможно, он был удален или ссылка неверна.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#1E2B6D]">Редактирование</h1>
          <p className="text-gray-500 text-sm">ID тура: {id}</p>
        </div>

        <TourForm
          isEdit={true}
          tourId={id}
          initialValues={{
            title: tour.title,
            description: tour.description,
            countryCode: tour.countryCode,
            category:
              tour.category && typeof tour.category === 'object'
                ? tour.category._id
                : (tour.category ?? ''),
            baseAdvantages: tour.baseAdvantages,
            images: [],
          }}
        />
      </div>
    </div>
  );
}
