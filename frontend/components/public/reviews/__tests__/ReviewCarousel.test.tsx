import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewsCarousel from '../ReviewsCarousel';
import { useGetFeaturedReviews } from '@/lib/hooks/reviewHooks';
import { useRouter } from 'next/navigation';

vi.mock('@/lib/hooks/reviewHooks', () => ({ useGetFeaturedReviews: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('@/components/shared/skeletons/ReviewCarouselSkeleton', () => ({
  default: () => <div data-testid="skeleton" />,
}));
vi.mock('@/components/shared/ErrorState', () => ({
  default: ({ onRetry }: { onRetry: () => void }) => (
    <button onClick={onRetry}>Повторить</button>
  ),
}));
vi.mock('@/components/shared/Rating', () => ({
  default: ({ value }: { value: number }) => (
    <div data-testid="rating">{value}</div>
  ),
}));

import { useEffect, useRef } from 'react';

const scrollPrev = vi.fn();
const scrollNext = vi.fn();

vi.mock('@/components/ui/carousel', () => {
  const { useEffect, useRef } = require('react');
  return {
    Carousel: ({
      children,
      setApi,
    }: {
      children: React.ReactNode;
      setApi?: (a: unknown) => void;
    }) => {
      const apiRef = useRef({
        canScrollPrev: () => true,
        canScrollNext: () => true,
        scrollPrev,
        scrollNext,
        on: () => {},
        off: () => {},
      });
      useEffect(() => {
        setApi?.(apiRef.current);
      }, [setApi]);
      return <div data-testid="carousel">{children}</div>;
    },
    CarouselContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    CarouselItem: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

const push = vi.fn();

const reviews = [
  {
    _id: 'r1',
    clientName: 'Людмила Андреева',
    comment: 'Отличный тур, всё понравилось',
    rating: 5,
    image: 'photo.png',
    createdAt: '2026-06-15T12:00:00Z',
    tourId: { _id: 't1', title: 'Уикенд в Стамбуле' },
  },
  {
    _id: 'r2',
    clientName: 'Павел Воля',
    comment: 'Гастротур в Грузию — отвал башки',
    rating: 4,
    image: null,
    createdAt: '2026-06-20T12:00:00Z',
    tourId: { _id: 't2', title: 'Винные дороги' },
  },
];

const setup = ({
  data = reviews,
  isLoading = false,
  isError = false,
}: {
  data?: typeof reviews | null;
  isLoading?: boolean;
  isError?: boolean;
} = {}) => {
  const refetch = vi.fn();
  vi.mocked(useRouter).mockReturnValue({ push } as never);
  vi.mocked(useGetFeaturedReviews).mockReturnValue({
    data,
    isLoading,
    isError,
    refetch,
  } as never);
  render(<ReviewsCarousel />);
  return { refetch };
};

describe('ReviewsCarousel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает скелетон при загрузке', () => {
    setup({ isLoading: true });
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('показывает ErrorState и вызывает refetch', async () => {
    const { refetch } = setup({ isError: true });
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(refetch).toHaveBeenCalled();
  });

  describe('пустое состояние', () => {
    it('показывается без отзывов', () => {
      setup({ data: [] });
      expect(
        screen.getByText('Скоро здесь появятся отзывы'),
      ).toBeInTheDocument();
    });

    it('показывается при data = null', () => {
      setup({ data: null });
      expect(
        screen.getByText('Скоро здесь появятся отзывы'),
      ).toBeInTheDocument();
    });

    it('содержит ссылку на туры', () => {
      setup({ data: [] });
      expect(
        screen.getByRole('link', { name: /Смотреть туры/ }),
      ).toHaveAttribute('href', '/tours');
    });

    it('не рендерит карусель', () => {
      setup({ data: [] });
      expect(screen.queryByTestId('carousel')).not.toBeInTheDocument();
    });
  });

  describe('список отзывов', () => {
    it('рендерит карусель с отзывами', () => {
      setup();
      expect(screen.getByTestId('carousel')).toBeInTheDocument();
      expect(
        screen.getByText('Отличный тур, всё понравилось'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Гастротур в Грузию — отвал башки'),
      ).toBeInTheDocument();
    });

    it('показывает имена авторов', () => {
      setup();
      expect(screen.getByText('Людмила Андреева')).toBeInTheDocument();
      expect(screen.getByText('Павел Воля')).toBeInTheDocument();
    });

    it('показывает названия туров', () => {
      setup();
      expect(screen.getByText('Уикенд в Стамбуле')).toBeInTheDocument();
      expect(screen.getByText('Винные дороги')).toBeInTheDocument();
    });

    it('рендерит рейтинги', () => {
      setup();
      const ratings = screen.getAllByTestId('rating');
      expect(ratings[0]).toHaveTextContent('5');
      expect(ratings[1]).toHaveTextContent('4');
    });

    it('показывает дату отзыва', () => {
      setup();
      expect(screen.getByText(/15 июня/)).toBeInTheDocument();
    });

    it('рендерит фото при наличии', () => {
      setup();
      expect(
        screen.getByAltText('Фото к отзыву от Людмила Андреева'),
      ).toBeInTheDocument();
    });

    it('не рендерит фото, если image отсутствует', () => {
      setup();
      expect(
        screen.queryByAltText('Фото к отзыву от Павел Воля'),
      ).not.toBeInTheDocument();
    });

    it('переходит на страницу тура по клику на отзыв', async () => {
      setup();
      await userEvent.click(screen.getByText('Отличный тур, всё понравилось'));
      expect(push).toHaveBeenCalledWith('/tours/t1');
    });
  });

  describe('навигация карусели', () => {
    it('прокручивает назад', async () => {
      setup();
      await userEvent.click(screen.getByRole('button', { name: 'назад' }));
      expect(scrollPrev).toHaveBeenCalled();
    });

    it('прокручивает вперёд', async () => {
      setup();
      await userEvent.click(screen.getByRole('button', { name: 'вперед' }));
      expect(scrollNext).toHaveBeenCalled();
    });
  });
});
