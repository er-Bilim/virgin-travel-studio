import { render, screen } from '@testing-library/react';
import StandardOrderAside from '../StandardOrderAside';
import { formatDayAndMonthWords, formatToReadablePrice } from '@/lib/utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { StandardOrder } from '@/types/order';

vi.mock('@/lib/utils');

vi.mock('../OrderSummaryCard', () => ({
  default: (props: {
    eyebrow: string;
    title: string;
    rows: { label: string; value: string }[];
    priceInfo?: { price: string; currency: string };
  }) => <div data-testid="order-summary-card">{JSON.stringify(props)}</div>,
}));

vi.mock('../../tours/SeatsCard', () => ({
  default: (props: { totalSeats: number; bookedSeats: number }) => (
    <div data-testid="seats-card">{JSON.stringify(props)}</div>
  ),
}));

const baseOrder: StandardOrder = {
  _id: 'order2',
  clientPhone: '+996700000001',
  clientName: 'Бекзат',
  status: 'IN_PROGRESS',
  rejectionReason: null,
  managerId: null,
  visibleId: 'ORD-002',
  createdAt: '2026-01-01T00:00:00.000Z',
  type: 'STANDARD',
  tourSetId: {
    _id: 'tourset1',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-09-10T00:00:00.000Z',
    price: 50000,
    hotelName: 'Radisson',
    tourId: {
      _id: 'tour1',
      title: 'Тур по Иссык-Кулю',
      category: { _id: 'cat1', title: 'Пляжный отдых' },
    },
    bookedSeats: 15,
    totalSeats: 20,
  },
};

describe('StandardOrderAside', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formatDayAndMonthWords).mockImplementation((date) => ({
      day: date === baseOrder.tourSetId.startDate ? '1' : '10',
      month: 'сентября',
      year: '2026',
    }));
    vi.mocked(formatToReadablePrice).mockReturnValue({
      price: '50 000',
      currency: 'сом',
    });
  });

  it('передаёт корректные eyebrow, title, rows и priceInfo в OrderSummaryCard', () => {
    render(<StandardOrderAside order={baseOrder} />);

    const card = screen.getByTestId('order-summary-card');
    expect(card).toHaveTextContent('Тур по Иссык-Кулю');
    expect(card).toHaveTextContent('Пляжный отдых');
    expect(card).toHaveTextContent('Radisson');
    expect(card).toHaveTextContent('50 000');
    expect(card).toHaveTextContent('сом');
  });

  it('передаёт totalSeats и bookedSeats в SeatsCard', () => {
    render(<StandardOrderAside order={baseOrder} />);

    const seats = screen.getByTestId('seats-card');
    expect(seats).toHaveTextContent('"totalSeats":20');
    expect(seats).toHaveTextContent('"bookedSeats":15');
  });
});
