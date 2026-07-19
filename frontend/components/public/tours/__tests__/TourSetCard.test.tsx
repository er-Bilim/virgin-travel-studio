import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TourSetCard from '../TourSetCard';
import type { TourSetType } from '@/types/tourSets';

const baseTourSet = {
  _id: 'set-1',
  startDate: '2026-09-10T12:00:00Z',
  endDate: '2026-09-13T12:00:00Z',
  hotelName: 'Legacy Ottoman Hotel',
  hotelLocation: 'Стамбул, Турция',
  airline: 'Turkish Airlines',
  flightDetails: 'FRU — IST, прямой',
  price: 45000,
  discountPrice: null,
  totalSeats: 20,
  bookedSeats: 5,
  isHot: false,
} as unknown as TourSetType;

const renderCard = (
  overrides: Partial<TourSetType> = {},
  id = '',
  getTourSet = vi.fn(),
) => {
  render(
    <TourSetCard
      tourSet={{ ...baseTourSet, ...overrides }}
      getTourSet={getTourSet}
      id={id}
    />,
  );
  return { getTourSet };
};

describe('TourSetCard', () => {
  it('показывает отель и перелёт', () => {
    renderCard();
    expect(screen.getByText('Legacy Ottoman Hotel')).toBeInTheDocument();
    expect(screen.getByText('Стамбул, Турция')).toBeInTheDocument();
    expect(screen.getByText('Turkish Airlines')).toBeInTheDocument();
    expect(screen.getByText('FRU — IST, прямой')).toBeInTheDocument();
  });

  it('вызывает getTourSet с id при клике', async () => {
    const { getTourSet } = renderCard();
    await userEvent.click(screen.getByText('Legacy Ottoman Hotel'));
    expect(getTourSet).toHaveBeenCalledWith('set-1');
  });

  it('не показывает метку "Выбран", если id не совпадает', () => {
    renderCard({}, 'other-id');
    expect(screen.queryByText('Выбран')).not.toBeInTheDocument();
  });

  it('показывает метку "Выбран" при совпадении id', () => {
    renderCard({}, 'set-1');
    expect(screen.getByText('Выбран')).toBeInTheDocument();
  });

  it('не показывает бейдж "горящий" по умолчанию', () => {
    renderCard();
    expect(screen.queryByText('горящий')).not.toBeInTheDocument();
  });

  it('показывает бейдж "горящий" при isHot', () => {
    renderCard({ isHot: true });
    expect(screen.getByText('горящий')).toBeInTheDocument();
  });

  it('показывает количество свободных мест', () => {
    renderCard({ totalSeats: 20, bookedSeats: 5 });
    expect(screen.getByText('15 мест')).toBeInTheDocument();
  });

  it('показывает "Мест нет" при отсутствии свободных', () => {
    renderCard({ totalSeats: 20, bookedSeats: 20 });
    expect(screen.getByText('Мест нет')).toBeInTheDocument();
  });

  it('без скидки показывает подпись "цена"', () => {
    renderCard();
    expect(screen.getByText('цена')).toBeInTheDocument();
  });

  it('со скидкой показывает обе цены', () => {
    renderCard({ price: 100000, discountPrice: 90000 });
    expect(screen.queryByText('цена')).not.toBeInTheDocument();
    expect(screen.getByText(/90/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});
