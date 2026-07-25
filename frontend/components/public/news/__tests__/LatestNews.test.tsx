import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LatestNews from '../LatestNews';
import { useNews } from '@/lib/hooks/newsHooks';

vi.mock('@/lib/hooks/newsHooks', () => ({ useNews: vi.fn() }));
vi.mock('@/components/shared/skeletons/LatestNewsSkeleton', () => ({
  default: () => <div data-testid="skeleton" />,
}));
vi.mock('@/components/shared/ErrorState', () => ({
  default: ({ onRetry }: { onRetry: () => void }) => (
    <button onClick={onRetry}>Повторить</button>
  ),
}));

const makeNews = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    _id: `n${i + 1}`,
    title: `Новость ${i + 1}`,
    content: 'Достаточно длинный текст новости для превью и обрезки.',
    image: i === 0 ? 'photo.png' : '',
    tags: ['турция', 'акции'],
    updatedAt: '2026-06-01T12:00:00Z',
  }));

const setup = ({
  news = makeNews(3),
  isLoading = false,
  isError = false,
} = {}) => {
  const refetch = vi.fn();
  vi.mocked(useNews).mockReturnValue({
    data: { allNews: news },
    isLoading,
    isError,
    refetch,
  } as never);
  render(<LatestNews />);
  return { refetch };
};

describe('LatestNews', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает скелетон при загрузке', () => {
    setup({ isLoading: true });
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('показывает ErrorState и вызывает refetch', async () => {
    const { refetch } = setup({ isError: true, news: [] });
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('показывает пустое состояние без новостей', () => {
    setup({ news: [] });
    expect(screen.getByText('Пока нет новостей')).toBeInTheDocument();
  });

  describe('главная новость', () => {
    it('помечена бейджем "главное"', () => {
      setup();
      expect(screen.getByText('главное')).toBeInTheDocument();
    });

    it('показывает заголовок, дату и превью', () => {
      setup();
      expect(screen.getByText('Новость 1')).toBeInTheDocument();
      expect(screen.getAllByText(/1 июня 2026/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Достаточно длинный текст/)).toBeInTheDocument();
    });

    it('ведёт на страницу новости', () => {
      setup();
      expect(screen.getByRole('link', { name: /Новость 1/ })).toHaveAttribute(
        'href',
        '/news/n1',
      );
    });

    it('показывает изображение при наличии', () => {
      setup();
      expect(screen.getByAltText('Новость 1')).toBeInTheDocument();
    });

    it('показывает заглушку без изображения', () => {
      setup({ news: [{ ...makeNews(1)[0], image: '' }] });
      expect(screen.getByText('Нет изображения')).toBeInTheDocument();
    });

    it('рендерит не более двух тегов', () => {
      setup({
        news: [{ ...makeNews(1)[0], tags: ['a', 'b', 'c', 'd'] }],
      });
      expect(screen.getByText('a')).toBeInTheDocument();
      expect(screen.getByText('b')).toBeInTheDocument();
      expect(screen.queryByText('c')).not.toBeInTheDocument();
    });
  });

  describe('второстепенные новости', () => {
    it('рендерятся при количестве больше одной', () => {
      setup({ news: makeNews(3) });
      expect(screen.getByText('Новость 2')).toBeInTheDocument();
      expect(screen.getByText('Новость 3')).toBeInTheDocument();
    });

    it('не рендерятся при единственной новости', () => {
      setup({ news: makeNews(1) });
      expect(screen.queryByText('Новость 2')).not.toBeInTheDocument();
    });

    it('показывают заглушку "Нет фото" без изображения', () => {
      setup({ news: makeNews(2) }); // вторая без image
      expect(screen.getByText('Нет фото')).toBeInTheDocument();
    });

    it('ведут на свои страницы', () => {
      setup({ news: makeNews(2) });
      expect(screen.getByRole('link', { name: /Новость 2/ })).toHaveAttribute(
        'href',
        '/news/n2',
      );
    });
  });

  it('при единственной новости сетка в одну колонку', () => {
    vi.mocked(useNews).mockReturnValue({
      data: { allNews: makeNews(1) },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    const { container } = render(<LatestNews />);
    expect(container.querySelector('.lg\\:grid-cols-1')).toBeInTheDocument();
  });
});
