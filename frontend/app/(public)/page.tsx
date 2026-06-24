'use client';

import Link from 'next/link';
import PublicTourCard from '@/components/public/tours/PublicTourCard';
import LatestNewsSection from '@/components/public/news/LatestNewsSection';
import { useTourSets } from '@/lib/hooks/tourSets';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { imageUrl } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import CustomTourCard from '@/components/public/home/tourCustomCard/CustomTourCard';
import { usePopularTours } from '@/lib/hooks/tourHooks';
import { toast } from 'sonner';

export default function Home() {
  const limit = 4;

  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    refetch: refetchSettings,
  } = useHomepageSettings();

  const {
    data: tours,
    isLoading: isToursLoading,
    isError: isToursError,
    refetch: refetchTours,
  } = usePopularTours(limit);

  const {
    isLoading: isTourSetsLoading,
    isError: isTourSetsError,
    refetch: refetchTourSets,
  } = useTourSets({ page: 1, limit: 100 });

  const isLoading = isToursLoading || isTourSetsLoading || isSettingsLoading;
  const showError = isToursError || isTourSetsError || isSettingsError;
  const showLoading = !showError && isLoading;

  const handleRefetch = () => {
    refetchTours();
    refetchTourSets();
    refetchSettings();
  };

  const videoSource = settings?.hero?.videoUrl
    ? `${imageUrl}${settings.hero.videoUrl}`
    : 'http://localhost:8000/videos/default.mp4';

  if (!tours) {
    return toast.error('Не удалось загрузить популярные туры')
  }

  return (
    <section className="w-full">
      <div className="relative left-1/2 -translate-x-1/2 w-screen h-[400px] md:h-[680px] bg-gradient-to-br from-[#1E2B6D] via-[#152054] to-[#0D153A]">
        <video
          src={videoSource}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/poster.jpg"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white px-4 text-center">
          <h1 className="text-3xl font-black md:text-5xl max-w-4xl leading-tight">
            {settings?.hero?.title || 'Путешествуй с нами'}
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg opacity-90 whitespace-pre-line">
            {settings?.hero?.subtitle ||
              'Наша компания занимается проектированием премиальных туров.'}
          </p>
        </div>
      </div>

      <section className="my-24">
        <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-800">
              Популярно сейчас
            </p>
            <h2 className="text-3xl font-black text-navy-700 md:text-4xl">
              Туры, которые выбирают
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Готовы к приключениям? Выбирайте маршрут – остальное мы возьмём на
              себя.
            </p>
          </div>

          <Link
            href="/tours"
            className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-navy-700 transition hover:border-cyan-600 hover:text-cyan-600"
          >
            Все туры
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {showLoading && (
          <p className="my-10 text-center text-lg font-semibold">
            Загрузка туров...
          </p>
        )}

        {showError && (
          <div className="my-10 text-center">
            <p className="mb-4 text-lg font-semibold text-red-500">
              Не удалось загрузить туры
            </p>
            <button
              type="button"
              className="rounded-2xl border px-5 py-3 font-semibold"
              onClick={handleRefetch}
            >
              Повторить
            </button>
          </div>
        )}

        {!showLoading && !showError && (
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

      <LatestNewsSection />

      <div className="mt-10 mb-15 flex flex-col items-center">
        <CustomTourCard />
      </div>
    </section>
  );
}
