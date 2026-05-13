"use client";
import { TourSetsCard } from '@/components/dashboard/tourSets/TourSetsCard';
import { useState } from "react";
import { useTourSets } from "@/lib/hooks/tourSets";
import { OrderCard } from "@/components/dashboard/orders/OrderCard";
import { PaginationCustom } from '@/components/pagination/PaginationCustom';


export default function TourSets() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedTourSetId, setSelectedTourSetId] = useState<string | null>(
    null,
  );

  const { data: tourSetsData, isLoading, isError, refetch } = useTourSets(page, limit);

    const tourSets = tourSetsData?.tourSets || [];
    const meta = tourSetsData?.meta;

    const handlePageChange = (newPage: number) => {
      setPage(newPage);
      window.scrollTo(0, 0);
    };

    const openModalOrder = (id: string) => {
      setSelectedTourSetId(id);
      setIsOrderOpen(true);
    };

    const closeModalOrder = () => {
      setSelectedTourSetId(null);
      setIsOrderOpen(false);
    }

  return (
    <section className="">
      {selectedTourSetId && isOrderOpen && (
        <OrderCard
          isOpen={isOrderOpen}
          tourSetId={selectedTourSetId}
          onClose={closeModalOrder}
        />
      )}
      <div className="col-span-2 py-2 mb-2">
        <p className="my-4 text-center text-2xl font-semibold">
          Доступные туры
        </p>
      </div>
      <div className="grid">
        <div>
          {isLoading && (
            <section>
              <p className="my-4 text-center text-2xl font-semibold">
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-3">
            {tourSets.map((tourSet) => (
              <TourSetsCard key={tourSet._id} tourSet={tourSet} openModal={openModalOrder} />
            ))}
          </div>
        </div>
      </div>

      {meta && (
        <PaginationCustom
          page={page}
          limit={meta.limit}
          totalPage={meta.totalPages}
          onChange={handlePageChange}
        />
      )}
    </section>
  );
}
