'use client';

import Link from 'next/link';
import PublicTourCard from '@/components/public/tours/PublicTourCard';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { ArrowRight, MapPinned } from 'lucide-react';
import { usePopularTours } from '@/lib/hooks/tourHooks';
import TourCardSkeleton from '@/components/shared/skeletons/TourCardSkeleton';
import SectionHeaderSkeleton from '@/components/shared/skeletons/SectionHeaderSkeleton';
import ErrorState from '@/components/shared/ErrorState';

const PopularToursSection = () => {
  const limit = 4;
  
  const {
    data: settings,
    isPending: isSettingsLoading,
    refetch: refetchSettings,
  } = useHomepageSettings();

  const {
    data: tours,
    isLoading: isToursLoading,
    isError: isToursError,
    refetch: refetchTours,
  } = usePopularTours(limit);

  const handleRefetch = () => {
    refetchTours();
    refetchSettings();
  };

  const renderSectionHeader = () => {
    if (isSettingsLoading) {
      return <SectionHeaderSkeleton/>
    }

    return (
      <>
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
            <MapPinned className="size-[18px]" />
            Популярно сейчас
          </p>
          <h2 className="text-3xl font-black tracking-tight text-navy-800">
            {settings?.mainPopularTours?.title || 'Туры, которые выбирают'}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground text-[15px]">
            {settings?.mainPopularTours?.subtitle || 'Готовы к приключениям? Выбирайте маршрут – остальное мы возьмём на себя'}
          </p>
        </div>
      </>
    )
  };
  
  return (
    <section>
      <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {renderSectionHeader()}

        <Link
          href="/tours"
          className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-navy-700 transition hover:border-cyan-600 hover:text-cyan-600"
        >
          Все туры
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {isToursLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: limit }).map((_, index) => (
            <TourCardSkeleton key={index} />
          ))}
        </div>
      )}
 

      {isToursError && (
        <ErrorState onRetry={handleRefetch} />
      )}

      {!isToursError && tours && (
        <>
          {tours.length === 0 ? (
            <p className="my-10 text-center text-gray-500">
              Сейчас нет опубликованных туров.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] items-stretch gap-6">
              {tours.map((tour) => (
                <PublicTourCard key={tour._id} tour={tour} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
};

export default PopularToursSection;