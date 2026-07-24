import { render, screen } from '@testing-library/react';
import CustomOrderAside from '../CustomOrderAside';
import countries from '@/lib/countries';
import { formatDayAndMonthWords } from '@/lib/utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { CustomOrder } from '@/types/order';

vi.mock('@/lib/countries');
vi.mock('@/lib/utils');

vi.mock('../OrderSummaryCard', () => ({
  default: (props: {
    eyebrow: string;
    title: string;
    rows: { label: string; value: string }[];
    priceInfo?: { price: string; currency: string };
  }) => <div data-testid="order-summary-card">{JSON.stringify(props)}</div>,
}));

vi.mock('../OrderCustomWishesCard', () => ({
  default: (props: { description: string; activities: string[] }) => (
    <div data-testid="order-custom-wishes-card">{JSON.stringify(props)}</div>
  ),
}));

const baseOrder: CustomOrder = {
  _id: 'order1',
  clientPhone: '+996700000000',
  clientName: 'Айгуль',
  status: 'NEW',
  rejectionReason: null,
  managerId: null,
  visibleId: 'ORD-001',
  createdAt: '2026-01-01T00:00:00.000Z',
  type: 'CUSTOM',
  customTour: {
    countryCode: 'KG',
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-08-10T00:00:00.000Z',
    hotel: 'Hyatt',
    description: 'Хочу горы и озеро',
    _id: 'custom1',
    activities: ['Пеший поход', 'Рыбалка'],
  },
};

describe('CustomOrderAside', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formatDayAndMonthWords).mockImplementation((date) => ({
      day: date === baseOrder.customTour.startDate ? '1' : '10',
      month: 'августа',
      year: '2026',
    }));
  });

  it('передаёт корректные eyebrow, title и rows в OrderSummaryCard при известной стране', () => {
    vi.mocked(countries.getName).mockReturnValue('Кыргызстан');
    render(<CustomOrderAside order={baseOrder} />);

    const card = screen.getByTestId('order-summary-card');
    expect(card).toHaveTextContent('Индивидуальный тур');
    expect(card).toHaveTextContent('KG Кыргызстан');
    expect(card).toHaveTextContent('Hyatt');
    expect(card).toHaveTextContent('По запросу');
  });

  it('использует фолбэк "Неизвестная страна", если countries.getName вернул undefined', () => {
    vi.mocked(countries.getName).mockReturnValue(undefined);
    render(<CustomOrderAside order={baseOrder} />);

    expect(screen.getByTestId('order-summary-card')).toHaveTextContent(
      'Неизвестная страна',
    );
  });

  it('передаёт description и activities в OrderCustomWishesCard', () => {
    vi.mocked(countries.getName).mockReturnValue('Кыргызстан');
    render(<CustomOrderAside order={baseOrder} />);

    const wishes = screen.getByTestId('order-custom-wishes-card');
    expect(wishes).toHaveTextContent('Хочу горы и озеро');
    expect(wishes).toHaveTextContent('Пеший поход');
    expect(wishes).toHaveTextContent('Рыбалка');
  });
});
