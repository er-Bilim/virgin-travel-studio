'use client';

import { useState } from 'react';

import { PaginationCustom } from '@/components/pagination/PaginationCustom';
import PublicTourCard from '@/components/public/tours/PublicTourCard';
import { useTours } from '@/lib/hooks/tourHooks';
import { useTourSets } from '@/lib/hooks/tourSets';

const Tours = () => {
    const [page, setPage] = useState(1);
    const limit = 10;

    const {
        data: toursData,
        isLoading: isToursLoading,
        isError: isToursError,
        refetch: refetchTours,
    } = useTours(page, limit);

    const {
        data: tourSetsData,
        isLoading: isTourSetsLoading,
        isError: isTourSetsError,
        refetch: refetchTourSets,
    } = useTourSets(1, 100);

    const tours = toursData?.tours.filter((tour) => tour.isPublished) || [];
    const tourSets = tourSetsData?.tourSets.filter(
        (tourSet) => tourSet.status !== 'FINISHED',
    ) || [];
    const meta = toursData?.meta;

    const isLoading = isToursLoading || isTourSetsLoading;
    const isError = isToursError || isTourSetsError;

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo(0, 0);
    };

    const handleRefetch = () => {
        refetchTours();
        refetchTourSets();
    };

    return (
        <section className="py-10">
            <div className="mb-10 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#39C6C5]">
                    Virgin Travel Studio
                </p>

                <h1 className="mt-3 text-3xl font-black text-[#1E2B6D] md:text-5xl">
                    Каталог авторских туров
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                    Выберите направление и подходящий поток. Завершенные потоки скрыты из каталога.
                </p>
            </div>

            {isLoading && (
                <p className="my-10 text-center text-lg font-semibold">
                    Загрузка туров...
                </p>
            )}

            {isError && (
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

            {!isLoading && !isError && (
                <>
                    {tours.length === 0 ? (
                        <p className="my-10 text-center text-gray-500">
                            Сейчас нет опубликованных туров.
                        </p>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                            {tours.map((tour) => (
                                <PublicTourCard
                                    key={tour._id}
                                    tour={tour}
                                    tourSets={tourSets}
                                />
                            ))}
                        </div>
                    )}

                    {meta && (
                        <div className="my-8">
                            <PaginationCustom
                                page={page}
                                limit={meta.limit}
                                totalPage={meta.totalPages}
                                onChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default Tours;