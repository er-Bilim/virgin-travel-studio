import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TourSetsTable from '../TourSetsTable';
import { useTourSets, useDeleteTourSet } from '@/lib/hooks/tourSets';
import { useRouter } from 'next/navigation';
import type { TourSetType, TourSetsGetType } from '@/types/tourSets';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/hooks/tourSets', () => ({
  useTourSets: vi.fn(),
  useDeleteTourSet: vi.fn(),
}));

vi.mock('@/components/dashboard/shared/date-range-picker/DateRangePicker', () => ({
  DateRangePicker: () => <div data-testid="date-range-picker">DateRangePicker Component</div>,
}));

vi.mock('@/components/dashboard/shared/data-table/data-table', () => ({
  DataTable: ({ data }: { data: TourSetType[] }) => (
    <div data-testid="mock-data-table">
      {data.length > 0 ? `Потоков в таблице: ${data.length}` : 'Нет потоков'}
    </div>
  ),
}));

const mockTourSet: TourSetType = {
  _id: 'set-1',
  tourId: {
    _id: 'tour-123',
    title: 'Тестовый тур',
    countryCode: 'KG',
    description: 'Описание',
    images: [],
    category: { _id: 'cat-1', title: 'Экскурсии' },
    baseAdvantages: [],
    rating: 5,
    ratingCount: 1,
    isPublished: true,
    createdAt: '2024-01-01T12:00:00.000Z',
  },
  startDate: '2024-05-01T00:00:00.000Z',
  endDate: '2024-05-10T00:00:00.000Z',
  price: 50000,
  hotelName: 'Отель Гранд',
  hotelLocation: 'Бишкек',
  airline: 'Air Manas',
  flightDetails: 'Прямой рейс',
  totalSeats: 20,
  bookedSeats: 5,
  isHot: false,
  saleDeadline: '2024-04-25T00:00:00.000Z',
  status: 'OPEN',
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedAt: '2024-01-01T12:00:00.000Z',
};

const mockTourSetsData: TourSetsGetType = {
  tourSets: [mockTourSet],
  meta: {
    page: 1,
    limit: 5,
    totalPages: 1,
    total: 1,
  },
};

describe('TourSetsTable Component (Dashboard)', () => {
  const mockPush = vi.fn();
  const mockDeleteMutate = vi.fn();

  const defaultProps = {
    tourId: 'tour-123',
    baseToursPath: '/admin/tours',
    userRole: 'ADMIN',
  };

  const setupHooks = ({
                        isLoading = false,
                        isError = false,
                        data = mockTourSetsData as TourSetsGetType | undefined,
                      } = {}) => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as never);

    vi.mocked(useTourSets).mockReturnValue({
      data,
      isLoading,
      isError,
    } as never);

    vi.mocked(useDeleteTourSet).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.innerWidth = 1200;
    setupHooks();
  });

  it('отображает заголовок "Потоки тура" и ссылку "Добавить поток"', () => {
    render(<TourSetsTable {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Потоки тура' })
    ).toBeInTheDocument();

    const addLink = screen.getByRole('link', { name: /Добавить поток/i });
    expect(addLink).toHaveAttribute('href', '/admin/tours/tour-123/groups/new');
  });

  it('отображает блок фильтрации периода дат и цены', () => {
    render(<TourSetsTable {...defaultProps} />);

    expect(screen.getByText('Период потока')).toBeInTheDocument();
    expect(screen.getByText('Макс. цена')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Сбросить фильтры/i })).toBeInTheDocument();
  });

  it('передает полученные данные о потоках в таблицу при успешном запросе', () => {
    render(<TourSetsTable {...defaultProps} />);

    expect(screen.getByTestId('mock-data-table')).toHaveTextContent('Потоков в таблице: 1');
  });

  it('сбрасывает фильтры при клике на кнопку "Сбросить фильтры"', async () => {
    const user = userEvent.setup();

    render(<TourSetsTable {...defaultProps} />);

    const resetButton = screen.getByRole('button', { name: /Сбросить фильтры/i });
    await user.click(resetButton);

    expect(screen.getByText(/500[\s\u00A0]000 сом/)).toBeInTheDocument();
  });
});