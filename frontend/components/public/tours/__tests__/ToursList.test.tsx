import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToursList from '../ToursList';
import { useTours, useGetTourCategories } from '@/lib/hooks/tourHooks';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

vi.mock('@/lib/hooks/tourHooks', () => ({
  useTours: vi.fn(),
  useGetTourCategories: vi.fn(),
}));
vi.mock('@/lib/hooks/homepageSettingsHooks', () => ({
  useHomepageSettings: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));
vi.mock('@/components/dashboard/shared/FilterCombobox', () => ({
  default: ({ selected }: { selected: string | null }) => (
    <div data-testid="filter-combobox">{selected ?? 'нет'}</div>
  ),
}));
vi.mock('@/components/public/tours/PublicTourCard', () => ({
  default: ({ tour }: { tour: { title: string } }) => (
    <li data-testid="tour-card">{tour.title}</li>
  ),
}));
vi.mock('@/components/shared/FilterCombobox', () => ({
  default: ({ selected }: { selected: string | null }) => (
    <div data-testid="filter-combobox">{selected ?? 'нет'}</div>
  ),
}));
vi.mock('@/components/shared/Sort', () => ({
  default: () => <div data-testid="sort" />,
}));
vi.mock('@/components/pagination/PaginationCustom', () => ({
  PaginationCustom: ({
    page,
    totalPage,
  }: {
    page: number;
    totalPage: number;
  }) => <div data-testid="pagination">{`${page}/${totalPage}`}</div>,
}));

const push = vi.fn();

const tours = [
  { _id: 't1', title: 'Уикенд в Стамбуле' },
  { _id: 't2', title: 'Фьорды Черногории' },
];

const categories = [
  { _id: 'c1', title: 'Экскурсионные' },
  { _id: 'c2', title: 'Пляжные' },
];

const setup = ({
  toursData = { tours, meta: { total: 2, limit: 9, totalPages: 3 } } as never,
  isError = false,
  params = '',
  settings = { toursPage: {} } as never,
} = {}) => {
  const refetch = vi.fn();
  vi.mocked(useRouter).mockReturnValue({ push } as never);
  vi.mocked(usePathname).mockReturnValue('/tours');
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(params) as never,
  );
  vi.mocked(useGetTourCategories).mockReturnValue({
    data: categories,
  } as never);
  vi.mocked(useHomepageSettings).mockReturnValue({ data: settings } as never);
  vi.mocked(useTours).mockReturnValue({
    data: toursData,
    isError,
    refetch,
  } as never);

  render(<ToursList />);
  return { refetch };
};

describe('ToursList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает StateCard ошибки и вызывает refetch', async () => {
    const { refetch } = setup({ isError: true });
    expect(screen.getByText('Не удалось загрузить туры')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('рендерит заголовок из настроек', () => {
    setup({
      settings: {
        toursPage: { title: 'Наши туры', badge: 'Каталог' },
      } as never,
    });
    expect(
      screen.getByRole('heading', { name: 'Наши туры', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Каталог')).toBeInTheDocument();
  });

  it('использует дефолтные тексты без настроек', () => {
    setup({ settings: { toursPage: {} } as never });
    expect(
      screen.getByRole('heading', { name: 'Путешествия' }),
    ).toBeInTheDocument();
  });

  it('рендерит карточки туров', () => {
    setup();
    expect(screen.getAllByTestId('tour-card')).toHaveLength(2);
    expect(screen.getByText('Уикенд в Стамбуле')).toBeInTheDocument();
  });

  it('показывает счётчик найденных с правильным склонением', () => {
    setup({
      toursData: {
        tours,
        meta: { total: 2, limit: 9, totalPages: 1 },
      } as never,
    });
    expect(screen.getByText(/2 тура/)).toBeInTheDocument();
  });

  it('показывает пустое состояние без туров', () => {
    setup({
      toursData: {
        tours: [],
        meta: { total: 0, limit: 9, totalPages: 0 },
      } as never,
    });
    expect(screen.getByText('Такого тура пока нет')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Создать кастомный тур' }),
    ).toHaveAttribute('href', '/tours/custom');
  });

  it('рендерит пагинацию при наличии туров', () => {
    setup();
    expect(screen.getByTestId('pagination')).toHaveTextContent('1/3');
  });

  it('не рендерит пагинацию при пустом списке', () => {
    setup({
      toursData: {
        tours: [],
        meta: { total: 0, limit: 9, totalPages: 0 },
      } as never,
    });
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  describe('фильтры-переключатели', () => {
    it('добавляет isHot в URL при клике', async () => {
      setup();
      await userEvent.click(screen.getByRole('button', { name: /Горящие/ }));

      const url = push.mock.calls[0][0] as string;
      expect(url).toContain('isHot=true');
    });

    it('убирает isHot, если он был активен', async () => {
      setup({ params: 'isHot=true' });
      await userEvent.click(screen.getByRole('button', { name: /Горящие/ }));

      const url = push.mock.calls[0][0] as string;
      expect(url).not.toContain('isHot=true');
    });

    it('добавляет hasDiscount в URL', async () => {
      setup();
      await userEvent.click(screen.getByRole('button', { name: /Скидка/ }));

      expect(push.mock.calls[0][0]).toContain('hasDiscount=true');
    });

    it('сбрасывает page при переключении фильтра', async () => {
      setup({ params: 'page=3' });
      await userEvent.click(screen.getByRole('button', { name: /Горящие/ }));

      expect(push.mock.calls[0][0]).not.toContain('page=');
    });
  });

  describe('поиск', () => {
    it('рендерит поле поиска', () => {
      setup();
      expect(screen.getByPlaceholderText('Название тура')).toBeInTheDocument();
    });

    it('передаёт debounced-значение в useTours', async () => {
      setup();
      await userEvent.type(
        screen.getByPlaceholderText('Название тура'),
        'Стамбул',
      );

      await waitFor(
        () => {
          const lastCall = vi.mocked(useTours).mock.calls.at(-1)?.[0];
          expect(lastCall?.search).toBe('Стамбул');
        },
        { timeout: 1000 },
      );
    });
  });

  it('рендерит комбобоксы категорий и стран', () => {
    setup();
    expect(screen.getAllByTestId('filter-combobox')).toHaveLength(2);
  });

  it('передаёт categoryId из URL в useTours', () => {
    setup({ params: 'categories=c1' });
    expect(useTours).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'c1' }),
    );
  });

  it('передаёт countryCode, но не при значении all', () => {
    setup({ params: 'countryCode=all' });
    expect(useTours).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: undefined }),
    );
  });
});
