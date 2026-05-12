"use client";
import { TourCard } from "@/components/dashboard/tours/TourCard";
import { useState } from "react";
import { useTours } from "@/lib/hooks/tourHooks";
import { OrderCard } from "@/components/dashboard/orders/OrderCard";


export default function Tours() {

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  const { data: tours = [], isLoading, isError, refetch } = useTours();

    const openOrder = (id: string) => {
      setSelectedTourId(id);
      setIsOrderOpen(true);
    };

    const closeModalOrder = () => {
      setSelectedTourId(null);
      setIsOrderOpen(false);
    }

  return (
    <section className="">
      {selectedTourId && isOrderOpen && (
        <OrderCard
          isOpen={isOrderOpen}
          tourId={selectedTourId}
          onClose={closeModalOrder}
        />
      )}
      <div className="col-span-2 py-2 mb-2">
        <p className="my-4 text-center text-2xl font-semibold">
          Доступные туры
        </p>
      </div>
      <div className="grid">
        <div></div>
        <div>
      {isLoading && (
        <section>
          <p className="my-4 text-center text-2xl font-semibold">Загрузка туров…</p>
        </section>
      )}

      {isError && (
          <section>
            <p className="my-4 text-center text-2xl font-semibold">
              Не удалось загрузить туры
            </p>
            <div className="flex justify-center">
              <button className="rounded-md border px-4 py-2" onClick={() => refetch()}>
                Повторить
              </button>
            </div>
          </section>
        )
      }
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
            {tours.map((tour) => (
              <TourCard key={tour._id} openModal={openOrder} tour={tour} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
