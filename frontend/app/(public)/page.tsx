'use client';

import Link from 'next/link';
import PublicTourCard from '@/components/public/tours/PublicTourCard';
import TourGroupCard from '@/components/tourGroup/tourGroupCard';
import LatestNewsSection from '@/components/public/news/LatestNewsSection';
import { Spinner } from '@/components/ui/spinner';
import { useTours } from '@/lib/hooks/tourHooks';
import { useTourSets } from '@/lib/hooks/tourSets';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { imageUrl } from '@/lib/constants';

export default function Home() {
  const limit = 4;

  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    refetch: refetchSettings,
  } = useHomepageSettings();

  const {
    data: toursData,
    isLoading: isToursLoading,
    isError: isToursError,
    refetch: refetchTours,
  } = useTours({ limit });

  const {
    isLoading: isTourSetsLoading,
    isError: isTourSetsError,
    refetch: refetchTourSets,
  } = useTourSets({ page: 1, limit: 100 });

  const tours = toursData?.tours.filter((tour) => tour.isPublished) || [];

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

      <div className="flex flex-col items-center mt-25 mb-15 text-center px-4">
        <h2 className="font-black text-[#1E2B6D] text-2xl md:text-4xl">
          {settings?.mainPopularTours?.title || 'Популярные туры сейчас'}
        </h2>
        <p className="mt-4 max-w-2xl text-gray-600 whitespace-pre-line">
          {settings?.mainPopularTours?.subtitle ||
            'Готов к приключениям? Тогда выбирай подходящий тур и давай с нами.'}
        </p>
      </div>

      <div className="px-4 max-w-7xl mx-auto w-full">
        {showLoading && (
          <div className="my-20 flex flex-col items-center justify-center gap-3">
            <Spinner className="w-8 h-8 text-[#1E2B6D]" />
            <p className="text-gray-500 text-sm font-medium">
              Загрузка актуального контента...
            </p>
          </div>
        )}

        {showError && (
          <div className="my-10 text-center">
            <p className="mb-4 text-lg font-semibold text-red-500">
              Не удалось загрузить данные
            </p>
            <button
              type="button"
              className="rounded-2xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
              onClick={handleRefetch}
            >
              Повторить попытку
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
              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 items-stretch">
                {tours.map((tour) => (
                  <PublicTourCard key={tour._id} tour={tour} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-center my-5">
          <Link href="/tours">
            <button className="text-[#1E2B6D] cursor-pointer font-semibold my-5 text-xl md:text-2xl active:scale-[0.98] active:translate-y-0 transition-all hover:-translate-y-0.5">
              Посмотреть все туры {'>>'}
            </button>
          </Link>
        </div>
      </div>

      <LatestNewsSection
        title={settings?.mainLatestNews?.title}
        subtitle={settings?.mainLatestNews?.subtitle}
      />

      <div className="mt-25 mb-15 flex flex-col items-center px-4">
        <h2 className="font-black text-[#1E2B6D] text-2xl md:text-4xl text-center">
          Хочешь свой кастомный тур?
        </h2>
        <p className="mt-4 max-w-2xl text-gray-600 text-center mb-8">
          Тогда можешь составить его из возможных локаций, и укажи даты, а мы
          займемся организацией.
        </p>
        <TourGroupCard />
      </div>
    </section>
  );
}
