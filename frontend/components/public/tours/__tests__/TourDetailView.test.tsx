import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TourDetailView from '../TourDetailView';
import { useTourById } from '@/lib/hooks/tourHooks';
import { useInfiniteReviews } from '@/lib/hooks/reviewHooks';
import { openWhatsApp } from '@/lib/whatsapp';

vi.mock('@/lib/hooks/tourHooks', () => ({ useTourById: vi.fn() }));
vi.mock('@/lib/hooks/reviewHooks', () => ({ useInfiniteReviews: vi.fn() }));
vi.mock('@/lib/whatsapp', () => ({
  openWhatsApp: vi.fn(),
  buildTourInquiryMessage: vi.fn(() => 'сообщение'),
}));
vi.mock('@/components/tourGallery/TourGallery', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="gallery">{title}</div>
  ),
}));
vi.mock('@/components/public/reviews/form/CreateReviewForm', () => ({
  default: () => <div data-testid="review-form" />,
}));
vi.mock('@/components/public/reviews/Review', () => ({
  default: ({ review }: { review: { comment: string } }) => (
    <div data-testid="review">{review.comment}</div>
  ),
}));
vi.mock('@/components/shared/SeatsIndicator', () => ({
  default: ({ free }: { free: number }) => (
    <span data-testid="seats">{free}</span>
  ),
}));
vi.mock('../TourSetCard', () => ({
  default: () => <div data-testid="tour-set-card" />,
}));
vi.mock('@/components/dashboard/orders/OrderCard', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="order-card">{isOpen ? 'open' : 'closed'}</div>
  ),
}));
vi.mock('@/app/(public)/tours/[slug]/loading', () => ({
  default: () => <div data-testid="loading" />,
}));
vi.mock('@/components/shared/DateRangePicker', () => ({
  DateRangePicker: () => <div data-testid="date-picker" />,
}));
vi.mock('@/components/shared/ErrorState', () => ({
  default: ({ onRetry }: { onRetry: () => void }) => (
    <button onClick={onRetry}>Повторить</button>
  ),
}));

const tourSet = {
  _id: 'set-1',
  startDate: '2026-09-10T12:00:00Z',
  endDate: '2026-09-13T12:00:00Z',
  saleDeadline: '2026-08-01T12:00:00Z',
  price: 45000,
  discountPrice: null,
  hotelName: 'Legacy Ottoman Hotel',
  hotelLocation: 'Стамбул, Турция',
  airline: 'Turkish Airlines',
  flightDetails: 'FRU — IST',
  totalSeats: 20,
  bookedSeats: 18,
  isHot: false,
  status: 'OPEN',
};

const tour = {
  _id: 't1',
  title: 'Уикенд в Стамбуле',
  description: 'Отличный тур по историческому центру.',
  images: ['a.png'],
  category: { _id: 'c1', title: 'Экскурсионные' },
  rating: 4.5,
  ratingCount: 12,
  baseAdvantages: ['Питание включено', 'Трансфер'],
  tourSets: [tourSet],
};

const setup = ({
  tourData = tour,
  isPending = false,
  isError = false,
  reviews = [] as Array<{ _id: string; comment: string }>,
  isLoadingReviews = false,
  isReviewsError = false,
  hasNextPage = false,
}: {
  tourData?: typeof tour | null;
  isPending?: boolean;
  isError?: boolean;
  reviews?: Array<{ _id: string; comment: string }>;
  isLoadingReviews?: boolean;
  isReviewsError?: boolean;
  hasNextPage?: boolean;
} = {}) => {
  const refetch = vi.fn();
  const fetchNextPage = vi.fn();
  vi.mocked(useTourById).mockReturnValue({
    data: tourData,
    isPending,
    isError,
    refetch,
  } as never);
  vi.mocked(useInfiniteReviews).mockReturnValue({
    data: { pages: [{ reviews }] },
    isLoading: isLoadingReviews,
    isError: isReviewsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage: false,
  } as never);
  render(<TourDetailView id="t1" />);
  return { refetch, fetchNextPage };
};

describe('TourDetailView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает лоадер при загрузке', () => {
    setup({ isPending: true });
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('показывает ErrorState и вызывает refetch', async () => {
    const { refetch } = setup({ isError: true, tourData: null as never });
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('показывает сообщение об отсутствии заездов', () => {
    setup({ tourData: { ...tour, tourSets: [] } as never });
    expect(screen.getByText(/Сейчас нет открытых заездов/)).toBeInTheDocument();
  });

  it('рендерит заголовок, описание и галерею', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: 'Уикенд в Стамбуле', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Отличный тур/)).toBeInTheDocument();
    expect(screen.getByTestId('gallery')).toHaveTextContent(
      'Уикенд в Стамбуле',
    );
  });

  it('рендерит преимущества тура', () => {
    setup();
    expect(screen.getByText('Питание включено')).toBeInTheDocument();
    expect(screen.getByText('Трансфер')).toBeInTheDocument();
  });

  it('показывает рейтинг и количество отзывов', () => {
    setup();
    expect(screen.getAllByText('4.5').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/отзыв/).length).toBeGreaterThan(0);
  });

  it('показывает "нет оценок" при нулевом рейтинге', () => {
    setup({ tourData: { ...tour, rating: 0, ratingCount: 0 } as never });
    expect(screen.getAllByText(/нет оценок/).length).toBeGreaterThan(0);
  });

  describe('цена', () => {
    it('показывает обычную цену без скидки', () => {
      setup();
      expect(screen.getAllByText(/45/).length).toBeGreaterThan(0);
    });

    it('показывает скидочную цену и бейдж "Скидка до"', () => {
      setup({
        tourData: {
          ...tour,
          tourSets: [{ ...tourSet, discountPrice: 40000 }],
        } as never,
      });
      expect(screen.getByText(/Скидка до/)).toBeInTheDocument();
      expect(screen.getAllByText(/40/).length).toBeGreaterThan(0);
    });
  });

  describe('горящий тур', () => {
    it('не показывает бейдж по умолчанию', () => {
      setup();
      expect(screen.queryByText('Горящий')).not.toBeInTheDocument();
    });

    it('показывает бейджи при isHot', () => {
      setup({
        tourData: { ...tour, tourSets: [{ ...tourSet, isHot: true }] } as never,
      });
      expect(screen.getByText('Горящий')).toBeInTheDocument();
      expect(screen.getByText('горящий')).toBeInTheDocument();
    });
  });

  it('показывает свободные места', () => {
    setup();
    expect(screen.getByTestId('seats')).toHaveTextContent('2'); // 20 - 18
  });

  it('показывает отель и перелёт', () => {
    setup();
    expect(screen.getByText('Legacy Ottoman Hotel')).toBeInTheDocument();
    expect(screen.getByText('Turkish Airlines')).toBeInTheDocument();
  });

  it('рендерит карточку заезда', () => {
    setup();
    expect(screen.getByTestId('tour-set-card')).toBeInTheDocument();
  });

  describe('модалка заявки', () => {
    it('закрыта по умолчанию', () => {
      setup();
      expect(screen.getByTestId('order-card')).toHaveTextContent('closed');
    });

    it('открывается по кнопке "Оставить заявку"', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: 'Оставить заявку' }),
      );
      expect(screen.getByTestId('order-card')).toHaveTextContent('open');
    });
  });

  it('открывает WhatsApp по клику', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
    expect(openWhatsApp).toHaveBeenCalledWith('сообщение');
  });

  describe('отзывы', () => {
    it('показывает спиннер при загрузке', () => {
      setup({ isLoadingReviews: true });
      expect(
        screen.queryByText(/Здесь появятся отзывы/),
      ).not.toBeInTheDocument();
    });

    it('показывает ошибку отзывов', () => {
      setup({ isReviewsError: true });
      expect(screen.getByText('Ошибка')).toBeInTheDocument();
    });

    it('показывает пустое состояние', () => {
      setup({ reviews: [] });
      expect(screen.getByText(/Здесь появятся отзывы/)).toBeInTheDocument();
    });

    it('рендерит список отзывов', () => {
      setup({
        reviews: [
          { _id: 'r1', comment: 'Отлично' },
          { _id: 'r2', comment: 'Супер' },
        ] as never,
      });
      expect(screen.getAllByTestId('review')).toHaveLength(2);
    });

    it('показывает кнопку "Загрузить еще" при hasNextPage', async () => {
      const { fetchNextPage } = setup({
        reviews: [{ _id: 'r1', comment: 'Отлично' }] as never,
        hasNextPage: true,
      });
      await userEvent.click(
        screen.getByRole('button', { name: /загрузить еще/i }),
      );
      expect(fetchNextPage).toHaveBeenCalled();
    });

    it('скрывает кнопку без следующей страницы', () => {
      setup({ reviews: [{ _id: 'r1', comment: 'Отлично' }] as never });
      expect(
        screen.queryByRole('button', { name: /загрузить еще/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('рендерит форму отзыва и пикер дат', () => {
    setup();
    expect(screen.getByTestId('review-form')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });
});
