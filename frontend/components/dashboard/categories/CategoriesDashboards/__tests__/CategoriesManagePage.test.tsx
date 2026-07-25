import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoriesManagePage from '../CategoriesManagePage';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/lib/hooks/categoryHooks';
import type { CategoryTypeResponse, TourCategoryType } from '@/types/tour';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/hooks/categoryHooks', () => ({
  useCategories: vi.fn(),
  useCreateCategory: vi.fn(),
  useDeleteCategory: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/dashboard/shared/data-table/data-table', () => ({
  DataTable: ({ data }: { data: TourCategoryType[] }) => (
    <div data-testid="mock-data-table">
      {data.length > 0 ? `Категорий в таблице: ${data.length}` : 'Нет категорий'}
    </div>
  ),
}));

const mockCategory: TourCategoryType = {
  _id: 'cat-1',
  title: 'Экскурсионные туры',
};

const mockCategoriesData: CategoryTypeResponse = {
  categories: [mockCategory],
  meta: {
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 1,
  },
};

describe('CategoriesManagePage Component', () => {
  const mockCreateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  const setupHooks = ({
                        isLoading = false,
                        isError = false,
                        data = mockCategoriesData as CategoryTypeResponse | undefined,
                      } = {}) => {
    vi.mocked(useCategories).mockReturnValue({
      data,
      isLoading,
      isError,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useCreateCategory).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as never);

    vi.mocked(useDeleteCategory).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupHooks();
  });

  it('отображает заголовок "Управление категориями" и форму создания', () => {
    render(<CategoriesManagePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Управление категориями' })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('Например: Экскурсионные туры')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Добавить категорию/i })
    ).toBeInTheDocument();
  });

  it('показывает ошибку валидации при попытке отправить пустую форму', async () => {
    const user = userEvent.setup();

    render(<CategoriesManagePage />);

    const submitButton = screen.getByRole('button', { name: /Добавить категорию/i });
    await user.click(submitButton);

    expect(await screen.findByText('Введите название категории')).toBeInTheDocument();
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('успешно вызывает создание категории при вводе валидного названия', async () => {
    const user = userEvent.setup();

    render(<CategoriesManagePage />);

    const input = screen.getByPlaceholderText('Например: Экскурсионные туры');
    const submitButton = screen.getByRole('button', { name: /Добавить категорию/i });

    await user.type(input, 'Горные туры');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        { title: 'Горные туры' },
        expect.any(Object)
      );
    });
  });

  it('отображает сообщение об ошибке при сбое загрузки категорий (Error state)', () => {
    setupHooks({ isError: true, data: undefined });

    render(<CategoriesManagePage />);

    expect(screen.getByText('Не удалось загрузить категории')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument();
  });

  it('передает полученные данные категорий в таблицу', () => {
    render(<CategoriesManagePage />);

    expect(screen.getByTestId('mock-data-table')).toHaveTextContent('Категорий в таблице: 1');
  });
});