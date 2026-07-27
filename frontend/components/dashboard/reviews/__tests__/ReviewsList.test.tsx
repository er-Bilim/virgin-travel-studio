import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewsList from '../ReviewsList';
import {
  useAdminReviews,
  useApproveReview,
  useDeleteReview,
  useFeatureReview,
} from '@/lib/hooks/reviewHooks';
import { useRouter } from 'next/navigation';
import type { IPaginationReviews, IReview } from '@/types/review';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/hooks/reviewHooks', () => ({
  useAdminReviews: vi.fn(),
  useApproveReview: vi.fn(),
  useDeleteReview: vi.fn(),
  useFeatureReview: vi.fn(),
}));

vi.mock('@/components/dashboard/shared/data-table/data-table', () => ({
  DataTable: ({ data }: { data: IReview[] }) => (
    <div data-testid="mock-data-table">
      {data.length > 0 ? `Отзывов в таблице: ${data.length}` : 'Нет отзывов'}
    </div>
  ),
}));

const mockTour = {
  _id: 'tour-1',
  title: 'Тур на Байкал',
  countryCode: 'RU',
  description: 'Описание тура',
  images: [],
  category: { _id: 'cat-1', title: 'Экскурсии' },
  baseAdvantages: [],
  rating: 5,
  ratingCount: 10,
  isPublished: true,
  createdAt: '2024-01-01T12:00:00.000Z',
};

const mockReview: IReview = {
  _id: 'rev-1',
  clientName: 'Елена Ивановна',
  rating: 5,
  comment: 'Прекрасный тур, очень понравилось!',
  image: null,
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedDate: '2024-01-01T12:00:00.000Z',
  tourId: mockTour,
  isModerated: 'approved',
  featuredOnHomepage: true,
};

const mockReviewsData: IPaginationReviews = {
  reviews: [mockReview],
  totalReviews: 1,
  page: 1,
  totalPage: 1,
};

describe('ReviewsList Component (Dashboard)', () => {
  const mockPush = vi.fn();
  const mockDeleteMutate = vi.fn();
  const mockApproveMutate = vi.fn();
  const mockFeatureMutate = vi.fn();

  // Функция настройки моков без any
  const setupHooks = ({
                        isLoading = false,
                        isError = false,
                        data = mockReviewsData as IPaginationReviews | undefined,
                      } = {}) => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as never);

    vi.mocked(useAdminReviews).mockReturnValue({
      data,
      isLoading,
      isError,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useDeleteReview).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as never);

    vi.mocked(useApproveReview).mockReturnValue({
      mutate: mockApproveMutate,
    } as never);

    vi.mocked(useFeatureReview).mockReturnValue({
      mutate: mockFeatureMutate,
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupHooks();
  });

  it('отображает заголовок "Отзывы" и вкладки статусов модерации', () => {
    render(<ReviewsList />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Отзывы' })
    ).toBeInTheDocument();

    expect(screen.getByText('Все отзывы')).toBeInTheDocument();
    expect(screen.getByText('Новые отзывы')).toBeInTheDocument();
    expect(screen.getByText('Одобренные отзывы')).toBeInTheDocument();
    expect(screen.getByText('Отклоненные отзывы')).toBeInTheDocument();
    expect(screen.getByText('На главной')).toBeInTheDocument();
  });

  it('отображает сообщение об ошибке при сбое загрузки отзывов (Error state)', () => {
    setupHooks({ isError: true, data: undefined });

    render(<ReviewsList />);

    expect(screen.getByText('Не удалось загрузить отзывы')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument();
  });

  it('передает полученные данные отзывов в таблицу при успешной загрузке', () => {
    render(<ReviewsList />);

    expect(screen.getByTestId('mock-data-table')).toHaveTextContent('Отзывов в таблице: 1');
  });

  it('позволяет переключать фильтрацию по вкладкам (например, "Новые отзывы")', async () => {
    const user = userEvent.setup();

    render(<ReviewsList />);

    const pendingTab = screen.getByRole('tab', { name: 'Новые отзывы' });
    await user.click(pendingTab);

    await waitFor(() => {
      expect(useAdminReviews).toHaveBeenLastCalledWith(
        expect.objectContaining({ isModerated: 'pending' })
      );
    });
  });
});