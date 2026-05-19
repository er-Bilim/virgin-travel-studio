'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useOneTourSet } from '@/lib/hooks/tourSets';
import { TourSetForm } from '@/components/dashboard/tourSets/TourSetForm';

export default function EditTourSet() {
  const params = useParams();
  const groudID = params.groupID as string;
  const tourID = params.id as string;

  const { data: tourSet, isLoading, isError } = useOneTourSet(groudID);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#1E2B6D]" />
        <span>Загрузка данных потока...</span>
      </div>
    );
  }

  if (isError || !tourSet) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Поток не найден</h2>
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
          <h1 className="text-2xl font-bold text-[#1E2B6D]">
            Редактирование потока
          </h1>
          <p className="text-gray-500 text-sm">ID потока: {groudID}</p>
        </div>

        <TourSetForm
          isEdit={true}
          parentTourId={tourID}
          tourSetId={groudID}
          initialValues={{
            startDate: tourSet.startDate ? tourSet.startDate : undefined,
            endDate: tourSet.endDate ? tourSet.endDate : undefined,
            price: tourSet.price,
            discountPrice: tourSet.discountPrice ?? undefined,
            hotelName: tourSet.hotelName,
            hotelLocation: tourSet.hotelLocation,
            airline: tourSet.airline || '',
            flightDetails: tourSet.flightDetails || '',
            totalSeats: tourSet.totalSeats,
            isHot: tourSet.isHot ?? false,
            status: tourSet.status ? (tourSet.status as any) : 'OPEN',
            saleDeadline: tourSet.saleDeadline
              ? tourSet.saleDeadline
              : undefined,
          }}
        />
      </div>
    </div>
  );
}
