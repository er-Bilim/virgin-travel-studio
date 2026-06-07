'use client';

import PublicTourCard from '@/components/public/tours/PublicTourCard';
import { useTours } from '@/lib/hooks/tourHooks';
import { useTourSets } from '@/lib/hooks/tourSets';
import TourGroupCard from '@/components/tourGroup/tourGroupCard';
import Link from 'next/link';


export default function Home() {
  const limit = 4;

  const {
    data: toursData,
    isLoading: isToursLoading,
    isError: isToursError,
    refetch: refetchTours,
  } = useTours(1, limit);

  const {
    data: tourSetsData,
    isLoading: isTourSetsLoading,
    isError: isTourSetsError,
    refetch: refetchTourSets,
  } = useTourSets({ page: 1, limit: 100 });

  const tours = toursData?.tours.filter((tour) => tour.isPublished) || [];
  const tourSets =
    tourSetsData?.tourSets.filter((tourSet) => tourSet.status !== 'FINISHED') ||
    [];

  const isLoading = isToursLoading || isTourSetsLoading;
  const isError = isToursError || isTourSetsError;
  const showError = isError;
  const showLoading = !showError && isLoading;

  const handleRefetch = () => {
    refetchTours();
    refetchTourSets();
  };

  return (
    <section className="">
      <div className="relative left-1/2 -translate-x-1/2 w-screen h-[400px] md:h-[680px]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/poster.jpg"
        >
          <source
            src="http://localhost:8000/videos/default.mp4"
            type="video/mp4"
          />
          <source
            src="http://localhost:8000/videos/default.webm"
            type="video/webm"
          />
        </video>

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-3xl font-black md:text-5xl">
            Путешествуй с нами
          </h1>
          <p className="mt-4 max-w-2xl">
            Наша компания занимается проектированием премиальных туров.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center mt-25 mb-15">
        <h2 className="font-black text-[#1E2B6D] text-2xl md:text-4xl">
          Популярные туры сейчас
        </h2>
        <p className="mt-4 max-w-2xl">
          Готов к приключениям? Тогда выбирай подходящий тур и давай с нами.
        </p>
      </div>

      <div>
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 items-stretch">
              {tours.map((tour) => (
                <PublicTourCard
                  key={tour._id}
                  tour={tour}
                />
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

      <div className="mt-25 mb-15 flex flex-col items-center">
        <h2 className="font-black text-[#1E2B6D] text-2xl md:text-4xl">
          Хочешь свой кастомный тур?
        </h2>
        <p className="mt-4 max-w-2xl">
          Тогда можешь составить его из возможных локаций, и укажи даты, а мы
          займемся организацией.
        </p>
        <TourGroupCard />
      </div>
    </section>
  );
}
