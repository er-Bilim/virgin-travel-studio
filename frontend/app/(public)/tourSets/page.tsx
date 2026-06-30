'use client';

import { useState } from 'react';
import { RefreshCw, CalendarDays, AlertCircle } from 'lucide-react';
import { TourSetsCard } from '@/components/dashboard/tourSets/TourSetsCard';
import { useTourSets } from '@/lib/hooks/tourSets';
import OrderCard from '@/components/dashboard/orders/OrderCard';
import { PaginationCustom } from '@/components/pagination/PaginationCustom';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import type { TourSetType } from '@/types/tourSets';

export default function TourSets() {
  const [page, setPage] = useState(1);
  const limit = 9;

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedTourSetId, setSelectedTourSetId] = useState<string | null>(
    null,
  );

  const {
    data: tourSetsData,
    isLoading,
    isError,
    refetch,
  } = useTourSets({ page, limit });

  const tourSets = tourSetsData?.tourSets || [];
  const meta = tourSetsData?.meta;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModalOrder = (id: string) => {
    setSelectedTourSetId(id);
    setIsOrderOpen(true);
  };

  const closeModalOrder = () => {
    setSelectedTourSetId(null);
    setIsOrderOpen(false);
  };

  const selectedTourSet: TourSetType =
    tourSets.find((tourSet) => tourSet._id === selectedTourSetId) ??
    tourSets[0] ??
    null;

  return (
    <div className="w-full pb-16">
      {selectedTourSetId && isOrderOpen && (
        <OrderCard
          isOpen={isOrderOpen}
          onClose={closeModalOrder}
          tourSetId={selectedTourSetId}
          tourTitle={selectedTourSetId}
          startDate={selectedTourSet.startDate}
          endDate={selectedTourSet.endDate}
          price={selectedTourSet.discountPrice ?? selectedTourSet.price}
        />
      )}

      <Breadcrumbs
        className="mt-5"
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Доступные туры', href: '/tour-sets' },
        ]}
      />

      <header className="mt-8 mb-8">
        <p className="text-cyan-800 font-semibold uppercase text-sm tracking-wider">
          Бронирование дат
        </p>
        <h1 className="font-black text-navy-800 dark:text-white text-4xl mt-3 md:text-5xl">
          Доступные туры
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-2xl text-base leading-relaxed">
          Выберите подходящие даты вылета, ознакомьтесь с программой и
          забронируйте ваше путешествие.
        </p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4"
            >
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-10 w-full rounded-xl mt-2" />
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <section className="mx-auto max-w-[640px] py-16 text-center flex flex-col items-center justify-center">
          <div className="mb-4 inline-flex p-4 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Не удалось загрузить туры
          </h2>
          <p className="mb-6 text-sm text-muted-foreground max-w-xs">
            Произошла ошибка при получении списка доступных дат. Попробуйте
            обновить данные.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex rounded-xl items-center px-5 py-2.5 cursor-pointer bg-[#1E2B6D] text-white hover:bg-[#152054] transition font-medium text-sm shadow-sm"
          >
            <RefreshCw className="size-4 mr-2" />
            Повторить
          </button>
        </section>
      )}

      {!isLoading && !isError && tourSets.length === 0 && (
        <section className="flex flex-col items-center justify-center py-20 text-center gap-3 max-w-md mx-auto">
          <div className="bg-muted rounded-full p-4 text-gray-400">
            <CalendarDays className="w-7 h-7" />
          </div>
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            Нет доступных дат
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            На данный момент все группы укомплектованы. Новые наборы появятся в
            ближайшее время.
          </p>
        </section>
      )}

      {!isLoading && !isError && tourSets.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {tourSets.map((tourSet) => (
            <TourSetsCard
              key={tourSet._id}
              tourSet={tourSet}
              openModal={openModalOrder}
            />
          ))}
        </div>
      )}

      {meta && tourSets.length > 0 && (
        <div className="my-12 border-t border-slate-100 dark:border-slate-800 pt-6">
          <PaginationCustom
            page={page}
            limit={meta.limit}
            totalPage={meta.totalPages}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
