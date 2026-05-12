"use client";
import { TourCard } from "@/components/dashboard/tours/TourCard";
import { useState } from "react";
import { useTours } from "@/lib/hooks/tourHooks";
import { OrderCard } from "@/components/dashboard/orders/OrderCard";


export default function Tours() {

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  const { data: tours = [], isLoading, isError, error, refetch } = useTours();

    const openOrder = (id: string) => {
      setSelectedTourId(id);
      setIsOrderOpen(prevState => !prevState);
    };

    const closeModalOrder = () => {
      setSelectedTourId(null);
      setIsOrderOpen((prevState) => !prevState);
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
      <div className="col-span-2 bg-gray-200 py-2 -mx-[100px] mb-2">
        <p className="my-4 text-center text-2xl font-semibold">
          Доступные туры
        </p>
      </div>
      <div className="grid">
        <div></div>
        <div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),450px))]">
            {tours.map((tour) => (
              <TourCard key={tour._id} openModal={openOrder} tour={tour} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
