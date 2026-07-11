import type { CustomOrder } from '@/types/order';
import OrderSummaryCard from './OrderSummaryCard';
import countries from '@/lib/countries';
import { formatDayAndMonthWords } from '@/lib/utils';
import OrderCustomWishesCard from './OrderCustomWishesCard';

interface Props {
  order: CustomOrder;
}

const CustomOrderAside = ({ order }: Props) => {
  const { customTour } = order;
  const countryName: string =
    countries.getName(customTour.countryCode, 'ru') ?? 'Неизвестная страна';
  const start = formatDayAndMonthWords(customTour.startDate, true);
  const end = formatDayAndMonthWords(customTour.endDate, true);

  const rows = [
    { label: 'Страна', value: countryName },
    {
      label: 'Даты',
      value: `${start.day} ${start.month} ${start.year} – ${end.day} ${end.month} ${end.year}`,
    },
    { label: 'Отель', value: customTour.hotel },
    { label: 'Cтоимость', value: 'По запросу' },
  ];

  return (
    <aside className="lg:col-span-4 space-y-6 w-full lg:sticky lg:top-6">
      <OrderSummaryCard
        eyebrow="Индивидуальный тур"
        title={`${customTour.countryCode} ${countryName}`}
        rows={rows}
      />
      <OrderCustomWishesCard
        description={customTour.description}
        activities={customTour.activities}
      />
    </aside>
  );
};

export default CustomOrderAside;
