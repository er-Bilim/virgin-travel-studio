import { render, screen, fireEvent } from '@testing-library/react';
import ToursManagePage from '../ToursManagePage';
import {
  useTours,
  useCountries,
  useDeleteTour,
  useTogglePublish,
} from '@/lib/hooks/tourHooks';
import { useCategories } from '@/lib/hooks/categoryHooks';
import { useUser } from '@/lib/hooks/authHooks';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { ITourWithTourSetFields, ToursGetResponse } from '@/types/tour';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/lib/hooks/tourHooks', () => ({
  useTours: vi.fn(),
  useCountries: vi.fn(),
  useDeleteTour: vi.fn(),
  useTogglePublish: vi.fn(),
}));

vi.mock('@/lib/hooks/categoryHooks', () => ({
  useCategories: vi.fn(),
}));

vi.mock('@/lib/hooks/authHooks', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/components/dashboard/shared/data-table/data-table', () => ({
  DataTable: ({ data }: { data: ITourWithTourSetFields[] }) => (
    <div data-testid="mock-data-table">
      {data.length > 0 ? `Туров в таблице: ${data.length}` : 'Нет туров'}
    </div>
  ),
}));

const mockTour: ITourWithTourSetFields = {
  _id: 'tour-1',
  title: 'Тур на Иссык-Куль',
  countryCode: 'KG',
  description: 'Описание тура',
  images: [],
  category: { _id: 'cat-1', title: 'Экскурсии' },
  baseAdvantages: [],
  rating: 5,
  ratingCount: 10,
  isPublished: true,
  createdAt: '2024-01-01T12:00:00.000Z',
  isHot: true,
  minPrice: 15000,
  discountPrice: 12000,
  hotelLocation: 'Иссык-Куль',
  nextStartDate: '2024-06-01T00:00:00.000Z',
  durationDays: 5,
  saleDeadline: '2024-05-25T00:00:00.000Z',
};

const mockToursData: ToursGetResponse = {
  tours: [mockTour],
  meta: {
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 1,
  },
};

describe('ToursManagePage Component (Dashboard)', () => {
  const mockPush = vi.fn();
  const mockDeleteMutate = vi.fn();
  const mockTogglePublishMutate = vi.fn();

  const setupHooks = ({
                        isLoading = false,
                        isError = false,
                        data = mockToursData as ToursGetResponse | undefined,
                      } = {}) => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as never);

    vi.mocked(usePathname).mockReturnValue('/admin/tours');
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as never);

    vi.mocked(useUser).mockReturnValue({
      data: { role: 'ADMIN' },
    } as never);

    vi.mocked(useCategories).mockReturnValue({
      data: { categories: [{ _id: 'cat-1', title: 'Экскурсии' }] },
    } as never);

    vi.mocked(useCountries).mockReturnValue({
      data: ['KG', 'KZ'],
    } as never);

    vi.mocked(useTours).mockReturnValue({
      data,
      isLoading,
      isError,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useDeleteTour).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as never);

    vi.mocked(useTogglePublish).mockReturnValue({
      mutate: mockTogglePublishMutate,
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupHooks();
  });

  it('отображает заголовок "Туры" и кнопку "Добавить тур"', () => {
    render(<ToursManagePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Туры' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Добавить тур/i })
    ).toBeInTheDocument();
  });

  it('показывает индикатор загрузки при получении данных (Loading state)', () => {
    setupHooks({ isLoading: true, data: undefined });

    render(<ToursManagePage />);

    expect(screen.getByText('Загрузка туров...')).toBeInTheDocument();
  });

  it('показывает блок ошибки при сбое загрузки списка туров (Error state)', () => {
    setupHooks({ isError: true, data: undefined });

    render(<ToursManagePage />);

    expect(
      screen.getByText('Не удалось загрузить список туров')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Повторить попытку' })
    ).toBeInTheDocument();
  });

  it('передает полученные данные туров в таблицу при успешном запросе', () => {
    render(<ToursManagePage />);

    expect(screen.getByTestId('mock-data-table')).toHaveTextContent('Туров в таблице: 1');
  });

  it('позволяет вводить текст в поле поиска по названию тура', () => {
    render(<ToursManagePage />);

    const searchInput = screen.getByPlaceholderText('Поиск по названию...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Иссык-Куль' } });

    expect(searchInput.value).toBe('Иссык-Куль');
  });
});