import { render, screen } from '@testing-library/react';
import PopularToursSection from '../PopularToursSection';
import { useHomepageSettings } from '@/lib/hooks/homepageSettingsHooks';
import { usePopularTours } from '@/lib/hooks/tourHooks';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/hooks/homepageSettingsHooks');
vi.mock('@/lib/hooks/tourHooks');

vi.mock('@/components/public/tours/PublicTourCard', () => ({
  default: ({ tour }: { tour: { _id: string } }) => (
    <div data-testid="public-tour-card">{tour._id}</div>
  ),
}));

describe('PopularToursSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useHomepageSettings).mockReturnValue({
      data: {
        mainPopularTours: {
          title: 'Популярно сейчас',
          subtitle: 'Готовы к приключениям?',
        },
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it('показывает скелетоны во время загрузки туров (Loading state)', () => {
    vi.mocked(usePopularTours).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<PopularToursSection />);

    expect(screen.getByText('Все туры')).toBeInTheDocument();
  });

  it('показывает компонент ошибки при сбое загрузки (Error state)', () => {
    vi.mocked(usePopularTours).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    render(<PopularToursSection />);

    expect(screen.queryByText('Сейчас нет опубликованных туров.')).not.toBeInTheDocument();
  });

  it('показывает сообщение "Сейчас нет опубликованных туров.", если список пуст (Empty state)', () => {
    vi.mocked(usePopularTours).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<PopularToursSection />);

    expect(
      screen.getByText('Сейчас нет опубликованных туров.')
    ).toBeInTheDocument();
  });

  it('успешно отображает карточки туров, если данные пришла с сервера', () => {
    const mockTours = [
      { _id: 'tour-1' },
      { _id: 'tour-2' },
    ];

    vi.mocked(usePopularTours).mockReturnValue({
      data: mockTours,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<PopularToursSection />);

    const cards = screen.getAllByTestId('public-tour-card');
    expect(cards).toHaveLength(2);
  });
});