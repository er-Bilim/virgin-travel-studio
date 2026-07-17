import { formatDayAndMonthWords, formatToReadablePrice } from '@/lib/utils';
import type { StandardOrder } from '@/types/order';
import SeatsCard from '../tours/SeatsCard';
import OrderSummaryCard from './OrderSummaryCard';

interface Props {
  order: StandardOrder;
}

const StandardOrderAside = ({ order }: Props) => {
  const { tourSetId } = order;

  const start = formatDayAndMonthWords(tourSetId.startDate, true);
  const end = formatDayAndMonthWords(tourSetId.endDate, true);
  const priceInfo = formatToReadablePrice(tourSetId.price);
  const totalSeats = tourSetId.totalSeats;
  const bookedSeats = tourSetId.bookedSeats;

  const rows = [
    { label: 'Категория', value: tourSetId.tourId.category.title },
    {
      label: 'Даты',
      value: `${start.day} ${start.month} ${start.year} – ${end.day} ${end.month} ${end.year}`,
    },
    { label: 'Отель', value: tourSetId.hotelName },
  ];

  return (
    <aside className="lg:col-span-4 space-y-6 w-full lg:sticky lg:top-6">
      <OrderSummaryCard
        eyebrow="Тур"
        title={tourSetId.tourId.title}
        rows={rows}
        priceInfo={priceInfo}
      />
      <SeatsCard totalSeats={totalSeats} bookedSeats={bookedSeats} />
    </aside>
  );
};

export default StandardOrderAside;
