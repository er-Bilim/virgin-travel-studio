import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsDetailView from '../NewsDetailView';
import { useGetSingleNews } from '@/lib/hooks/newsHooks';
import { usePopularTours } from '@/lib/hooks/tourHooks';
import { usePathname } from 'next/navigation';

vi.mock('@/lib/hooks/newsHooks', () => ({ useGetSingleNews: vi.fn() }));
vi.mock('@/lib/hooks/tourHooks', () => ({ usePopularTours: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
vi.mock('@/components/public/buttons/share/ShareButton', () => ({
  default: ({ platform, variant }: { platform: string; variant?: string }) => (
    <div data-testid={`share-${platform}-${variant ?? 'icon'}`} />
  ),
}));
vi.mock('@/components/shared/skeletons/NewsDetailSkeleton', () => ({
  default: () => <div data-testid="skeleton" />,
}));
vi.mock('@/components/shared/ErrorState', () => ({
  default: ({ onRetry }: { onRetry: () => void }) => (
    <button onClick={onRetry}>Повторить</button>
  ),
}));

const baseNews = {
  _id: 'n1',
  title: 'Раннее бронирование открыто',
  content:
    'Первый вводный абзац.\nВторой обычный абзац.\n- Пункт списка один\n- Пункт списка два',
  image: 'photo.png',
  tags: ['турция', 'акции'],
  author: { fullName: 'admin' },
  createdAt: '2026-06-01T12:00:00Z',
};

const tours = [
  { _id: 't1', title: 'Уикенд в Стамбуле', images: ['a.png'], minPrice: 45000 },
  { _id: 't2', title: 'Фьорды Черногории', images: [], minPrice: 75000 },
];

const setup = ({
  news = baseNews as never,
  isLoading = false,
  isError = false,
  toursData = tours as never,
} = {}) => {
  const refetch = vi.fn();
  vi.mocked(usePathname).mockReturnValue('/news/n1');
  vi.mocked(useGetSingleNews).mockReturnValue({
    data: news,
    isLoading,
    isError,
    refetch,
  } as never);
  vi.mocked(usePopularTours).mockReturnValue({ data: toursData } as never);

  render(<NewsDetailView id="n1" tourLimit={4} />);
  return { refetch };
};

describe('NewsDetailView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает скелетон при загрузке', () => {
    setup({ isLoading: true });
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('показывает ErrorState при ошибке и вызывает refetch', async () => {
    const { refetch } = setup({ isError: true, news: null as never });
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('показывает ErrorState, если news отсутствует', () => {
    setup({ news: null as never });
    expect(
      screen.getByRole('button', { name: 'Повторить' }),
    ).toBeInTheDocument();
  });

  it('рендерит заголовок статьи', () => {
    setup();
    expect(
      screen.getByRole('heading', {
        name: 'Раннее бронирование открыто',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it('рендерит теги', () => {
    setup();
    expect(screen.getByText('турция')).toBeInTheDocument();
    expect(screen.getByText('акции')).toBeInTheDocument();
  });

  it('не рендерит теги при пустом массиве', () => {
    setup({ news: { ...baseNews, tags: [] } as never });
    expect(screen.queryByText('турция')).not.toBeInTheDocument();
  });

  it('показывает автора и дату', () => {
    setup();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('июня')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('считает время чтения', () => {
    setup();
    expect(screen.getByText('1 мин чтения')).toBeInTheDocument();
  });

  it('рендерит изображение статьи с alt по заголовку', () => {
    setup();
    expect(
      screen.getByAltText('Раннее бронирование открыто'),
    ).toBeInTheDocument();
  });

  it('не рендерит изображение без image', () => {
    setup({ news: { ...baseNews, image: '' } as never });
    expect(
      screen.queryByAltText('Раннее бронирование открыто'),
    ).not.toBeInTheDocument();
  });

  describe('парсинг контента', () => {
    it('рендерит обычные абзацы', () => {
      setup();
      expect(screen.getByText('Первый вводный абзац.')).toBeInTheDocument();
      expect(screen.getByText('Второй обычный абзац.')).toBeInTheDocument();
    });

    it('собирает пункты списка в ul', () => {
      setup();
      expect(screen.getByText('Пункт списка один')).toBeInTheDocument();
      expect(screen.getByText('Пункт списка два')).toBeInTheDocument();
    });

    it('первый абзац оформлен как лид', () => {
      setup();
      const lead = screen.getByText('Первый вводный абзац.');
      expect(lead.className).toContain('text-xl');
    });
  });

  it('рендерит кнопки шеринга (иконки и подписанные)', () => {
    setup();
    expect(screen.getByTestId('share-telegram-icon')).toBeInTheDocument();
    expect(screen.getByTestId('share-whatsapp-icon')).toBeInTheDocument();
    expect(screen.getByTestId('share-telegram-labeled')).toBeInTheDocument();
  });

  describe('сайдбар популярных туров', () => {
    it('рендерит список туров', () => {
      setup();
      expect(screen.getByText('Уикенд в Стамбуле')).toBeInTheDocument();
      expect(screen.getByText('Фьорды Черногории')).toBeInTheDocument();
    });

    it('ведёт на страницы туров', () => {
      setup();
      expect(
        screen.getByRole('link', { name: /Уикенд в Стамбуле/ }),
      ).toHaveAttribute('href', '/tours/t1');
    });

    it('показывает CTA сборки тура', () => {
      setup();
      expect(screen.getByRole('link', { name: /Собрать тур/ })).toHaveAttribute(
        'href',
        '/tours/custom',
      );
    });

    it('не падает, если tours не пришли', () => {
      expect(() => setup({ toursData: undefined as never })).not.toThrow();
    });
  });
});
