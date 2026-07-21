import { render, screen } from '@testing-library/react';
import PublicTourCard from '@/components/public/tours/PublicTourCard';
import type { ITourWithTourSetFields } from '@/types/tour';

vi.mock('@/components/public/tours/CountdownTimer', () => ({
  default: () => <div data-testid="countdown">таймер</div>,
}));

const baseTour = {
  _id: '1',
  title: 'Уикенд в Стамбуле',
  images: [],
  category: { title: 'Экскурсионные' },
  isHot: false,
  saleDeadline: null,
  nextStartDate: '2026-09-10T12:00:00Z',
  hotelLocation: 'Стамбул, Турция',
  durationDays: 5,
  rating: 4.5,
  ratingCount: 12,
  minPrice: 45000,
  discountPrice: null,
} as unknown as ITourWithTourSetFields;

const renderCard = (overrides: Partial<ITourWithTourSetFields> = {}) =>
  render(<PublicTourCard tour={{ ...baseTour, ...overrides }} />);

describe('PublicTourCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('показывает название, категорию и локацию', () => {
    renderCard();
    expect(screen.getByText('Уикенд в Стамбуле')).toBeInTheDocument();
    expect(screen.getByText('Экскурсионные')).toBeInTheDocument();
    expect(screen.getByText('Стамбул, Турция')).toBeInTheDocument();
  });

  it('ведёт на страницу тура', () => {
    renderCard();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tours/1');
  });

  describe('локация и длительность', () => {
    it('показывает "уточняется" без локации', () => {
      renderCard({ hotelLocation: undefined });
      expect(screen.getAllByText('уточняется').length).toBeGreaterThan(0);
    });

    it('склоняет дни', () => {
      renderCard({ durationDays: 5 });
      expect(screen.getByText('дней')).toBeInTheDocument();
    });

    it('склоняет для 1 дня', () => {
      renderCard({ durationDays: 1 });
      expect(screen.getByText('день')).toBeInTheDocument();
    });

    it('показывает "уточняется" без длительности', () => {
      renderCard({ durationDays: 0 });
      expect(screen.getAllByText('уточняется').length).toBeGreaterThan(0);
    });
  });

  describe('цена', () => {
    it('показывает "Цена по запросу" при minPrice = 0', () => {
      renderCard({ minPrice: 0 });
      expect(screen.getByText('Цена')).toBeInTheDocument();
      expect(screen.getByText('запросу')).toBeInTheDocument();
    });

    it('без скидки не показывает процент', () => {
      renderCard();
      expect(screen.queryByText(/–\d+%/)).not.toBeInTheDocument();
    });

    it('со скидкой показывает процент', () => {
      renderCard({ minPrice: 100000, discountPrice: 90000 });
      expect(screen.getByText('–10%')).toBeInTheDocument();
    });

    it('со скидкой показывает обе цены', () => {
      renderCard({ minPrice: 100000, discountPrice: 90000 });
      expect(screen.getByText(/90/)).toBeInTheDocument();
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });
  });

  describe('горящий тур', () => {
    it('без isHot не показывает бейдж', () => {
      renderCard({ isHot: false });
      expect(screen.queryByText('горит')).not.toBeInTheDocument();
    });

    it('с isHot показывает бейдж', () => {
      renderCard({ isHot: true });
      expect(screen.getByText('горит')).toBeInTheDocument();
    });

    it('показывает дату дедлайна, если до него больше суток', () => {
      renderCard({ isHot: true, saleDeadline: '2026-07-20T12:00:00Z' });
      expect(screen.getByText(/Скидка до/)).toBeInTheDocument();
      expect(screen.queryByTestId('countdown')).not.toBeInTheDocument();
    });

    it('показывает таймер, если осталось меньше суток', () => {
      renderCard({ isHot: true, saleDeadline: '2026-07-01T20:00:00Z' });
      expect(screen.getByTestId('countdown')).toBeInTheDocument();
    });

    it('не показывает блок дедлайна, если срок истёк', () => {
      renderCard({ isHot: true, saleDeadline: '2026-06-01T12:00:00Z' });
      expect(screen.queryByText(/Скидка до/)).not.toBeInTheDocument();
      expect(screen.queryByTestId('countdown')).not.toBeInTheDocument();
    });

    it('не показывает дедлайн, если тур не горящий', () => {
      renderCard({ isHot: false, saleDeadline: '2026-07-20T12:00:00Z' });
      expect(screen.queryByText(/Скидка до/)).not.toBeInTheDocument();
    });
  });
});
