import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsDetailView from '../NewsDetailView';
import { useGetSingleNews } from '@/lib/hooks/newsHooks';
import { usePopularTours } from '@/lib/hooks/tourHooks';
import { usePathname } from 'next/navigation';
import { formatDayAndMonthWords, formatToReadablePrice } from '@/lib/utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type * as UtilsModule from '@/lib/utils';
import type * as ConstantsModule from '@/lib/constants';
import type { INews } from '@/types/news';
import type { ITourWithTourSetFields } from '@/types/tour';

vi.mock('@/lib/hooks/newsHooks');
vi.mock('@/lib/hooks/tourHooks');
vi.mock('next/navigation');

vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof UtilsModule>();
  return {
    ...actual,
    formatDayAndMonthWords: vi.fn(),
    formatToReadablePrice: vi.fn(),
  };
});

vi.mock('@/lib/constants', async (importOriginal) => {
  const actual = await importOriginal<typeof ConstantsModule>();
  return {
    ...actual,
    imageUrl: 'http://localhost:8000/',
    isDev: false,
  };
});

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ),
}));

vi.mock('@/assets/placeholders/content_placeholder.png', () => ({
  default: 'placeholder.png',
}));

vi.mock('@/components/shared/Breadcrumbs', () => ({
  Breadcrumbs: (props: { items: { label: string; href?: string }[] }) => (
    <nav data-testid="breadcrumbs">{JSON.stringify(props.items)}</nav>
  ),
}));

vi.mock('@/components/shared/ClientAvatar', () => ({
  default: ({ name }: { name: string }) => (
    <div data-testid="client-avatar">{name}</div>
  ),
}));

vi.mock('@/components/shared/ErrorState', () => ({
  default: ({ onRetry }: { onRetry: () => void }) => (
    <div data-testid="error-state">
      <button onClick={onRetry}>Повторить</button>
    </div>
  ),
}));

vi.mock('@/components/shared/skeletons/NewsDetailSkeleton', () => ({
  default: () => <div data-testid="news-detail-skeleton" />,
}));

vi.mock('@/components/public/buttons/share/ShareButton', () => ({
  default: ({ platform, title }: { platform: string; title: string }) => (
    <button data-testid={`share-${platform}`}>{title}</button>
  ),
}));

const baseNews: INews = {
  _id: 'news1',
  title: 'Открытие нового направления',
  content: 'Ведущий абзац текста.',
  image: null,
  tags: [],
  author: { fullName: 'Айгуль Токтосунова', _id: 'author1' },
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

const baseTour: ITourWithTourSetFields = {
  _id: 'tour1',
  title: 'Тур по Иссык-Кулю',
  countryCode: 'KG',
  description: 'Описание тура',
  images: [],
  category: { _id: 'cat1', title: 'Пляжный отдых' },
  baseAdvantages: [],
  rating: 4.8,
  ratingCount: 12,
  isPublished: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  isHot: false,
  minPrice: 50000,
  hotelLocation: 'Чолпон-Ата',
  nextStartDate: '2026-08-01T00:00:00.000Z',
  durationDays: 7,
  saleDeadline: '2026-07-20T00:00:00.000Z',
};

const mockQuery = (data: Partial<ReturnType<typeof useGetSingleNews>>) =>
  data as unknown as ReturnType<typeof useGetSingleNews>;

describe('NewsDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue('/news/news1');
    process.env.NEXT_PUBLIC_SITE_URL = 'https://virgintravel.kg';
    vi.mocked(formatDayAndMonthWords).mockReturnValue({
      day: '1',
      month: 'июня',
      year: '2026',
    });
    vi.mocked(formatToReadablePrice).mockReturnValue({
      price: '50 000',
      currency: 'сом',
    });
    vi.mocked(usePopularTours).mockReturnValue({
      data: [baseTour],
    } as ReturnType<typeof usePopularTours>);
  });

  it('показывает скелетон во время загрузки', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(screen.getByTestId('news-detail-skeleton')).toBeInTheDocument();
  });

  it('показывает ErrorState при isError=true', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('показывает ErrorState, если новость не найдена (data=undefined без isError)', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('вызывает refetch при клике на кнопку повтора в ErrorState', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch,
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    await user.click(screen.getByText('Повторить'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('отображает заголовок, автора, отформатированную дату и время чтения', () => {
    const content = Array(250).fill('слово').join(' ');
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: { ...baseNews, content },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);

    expect(screen.getByText('Открытие нового направления')).toBeInTheDocument();
    expect(screen.getAllByText('Айгуль Токтосунова').length).toBeGreaterThan(0);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('июня')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('2 мин чтения')).toBeInTheDocument();
  });

  it('передаёт корректные items в Breadcrumbs', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: baseNews,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs).toHaveTextContent('Новости');
    expect(breadcrumbs).toHaveTextContent('/news');
    expect(breadcrumbs).toHaveTextContent('Открытие нового направления');
  });

  it('рендерит теги, если они есть', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: { ...baseNews, tags: ['туризм', 'акция'] },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(screen.getByText('туризм')).toBeInTheDocument();
    expect(screen.getByText('акция')).toBeInTheDocument();
  });

  it('не рендерит теги, если tags пустой', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: baseNews,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(screen.getByLabelText('Теги статьи')).toBeEmptyDOMElement();
  });

  it('разбивает контент на абзацы и списки корректно', () => {
    const content =
      'Ведущий абзац текста.\n- Первый пункт\n- Второй пункт\nЗаключительный абзац.';
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: { ...baseNews, content },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);

    expect(screen.getByText('Ведущий абзац текста.')).toBeInTheDocument();
    expect(screen.getByText('Заключительный абзац.')).toBeInTheDocument();

    const list = screen.getByText('Первый пункт').closest('ul');
    expect(list).toContainElement(screen.getByText('Второй пункт'));
  });

  it('не рендерит изображение новости, если news.image отсутствует', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: baseNews,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(
      screen.queryByAltText('Открытие нового направления'),
    ).not.toBeInTheDocument();
  });

  it('рендерит изображение новости с корректным src, если news.image есть', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: { ...baseNews, image: 'photo123.jpg' },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(screen.getByAltText('Открытие нового направления')).toHaveAttribute(
      'src',
      'http://localhost:8000/api/news/image/photo123.jpg',
    );
  });

  it('рендерит кнопки шеринга', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: baseNews,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(screen.getAllByTestId('share-telegram').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('share-whatsapp').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('share-copy').length).toBeGreaterThan(0);
  });

  it('рендерит популярные туры с ценой и картинкой-заглушкой при отсутствии images', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: baseNews,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={3} />);

    expect(screen.getByText('Тур по Иссык-Кулю')).toBeInTheDocument();
    expect(screen.getByText('50 000')).toBeInTheDocument();
    expect(screen.getByText('сом')).toBeInTheDocument();
    expect(screen.getByAltText('Тур по Иссык-Кулю')).toHaveAttribute(
      'src',
      'placeholder.png',
    );
  });

  it('использует реальное изображение тура, если images[0] есть', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: baseNews,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );
    vi.mocked(usePopularTours).mockReturnValue({
      data: [{ ...baseTour, images: ['tour1.jpg'] }],
    } as ReturnType<typeof usePopularTours>);

    render(<NewsDetailView id="news1" tourLimit={3} />);
    expect(screen.getByAltText('Тур по Иссык-Кулю')).toHaveAttribute(
      'src',
      'http://localhost:8000/api/tours/image/tour1.jpg',
    );
  });

  it('вызывает usePopularTours с переданным tourLimit', () => {
    vi.mocked(useGetSingleNews).mockReturnValue(
      mockQuery({
        data: baseNews,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      }),
    );

    render(<NewsDetailView id="news1" tourLimit={7} />);
    expect(usePopularTours).toHaveBeenCalledWith(7);
  });
});
