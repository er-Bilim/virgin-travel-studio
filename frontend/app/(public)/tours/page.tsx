"use client";
import { TourCard } from "@/components/dashboard/tours/TourCard";
import { useTours } from "@/lib/hooks/tourHooks";
import { PaginationCustom } from "@/components/pagination/PaginationCustom";
import { useState } from "react";

export default function Tours() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: toursData, isLoading, isError, refetch } = useTours(page, limit);

  const tours = toursData?.tours || [];
  const meta = toursData?.meta;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <section className="">
      <div className="col-span-2 py-2 mb-2">
        <p className="my-4 text-center text-2xl font-semibold">
          Доступные туры
        </p>
      </div>
      <div className="grid">
        <div>
          {isLoading && (
            <section>
              <p className="my-4 text-center text-lg md:text-2xl font-semibold">
                Загрузка туров…
              </p>
            </section>
          )}

          {isError && (
            <section>
              <p className="my-4 text-center text-2xl font-semibold">
                Не удалось загрузить туры
              </p>
              <div className="flex justify-center">
                <button
                  className="rounded-md border px-4 py-2"
                  onClick={() => refetch()}
                >
                  Повторить
                </button>
              </div>
            </section>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
            {tours.map((tour) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </div>
        </div>
      </div>

      <div className="my-8">
        {meta && (
          <PaginationCustom
            page={page}
            limit={meta.limit}
            totalPage={meta.totalPages}
            onChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
}
