import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsList from '../NewsList';
import { useNews, useDeleteNews, usePublicateNews } from '@/lib/hooks/newsHooks';
import { useUsers } from '@/lib/hooks/userHooks';
import { useModalStore } from '@/lib/stores/modalStore';
import type { NewsData, NewsFields } from '@/types/news';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/hooks/newsHooks', () => ({
  useNews: vi.fn(),
  useDeleteNews: vi.fn(),
  usePublicateNews: vi.fn(),
}));

vi.mock('@/lib/hooks/userHooks', () => ({
  useUsers: vi.fn(),
}));

vi.mock('@/lib/stores/modalStore', () => ({
  useModalStore: vi.fn(),
}));

vi.mock('@/components/dashboard/news/CreateNewsForm', () => ({
  default: () => <div data-testid="create-news-form">Create News Form</div>,
}));

vi.mock('@/components/dashboard/news/NewsDetailedInfo', () => ({
  default: () => <div data-testid="news-detailed-info">News Detailed Info</div>,
}));

const mockNewsItem: NewsFields = {
  _id: 'news-1',
  title: 'Тестовая новость 1',
  content: 'Текст новости 1',
  image: 'img-1.jpg',
  tags: ['туризм'],
  isPublished: true,
  author: {
    _id: 'user-1',
    fullName: 'Иван Иванов',
  },
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedAt: '2024-01-01T12:00:00.000Z',
};

const mockNewsData: NewsData = {
  allNews: [mockNewsItem],
  metadata: {
    page: 1,
    limit: 10,
    totalPages: 2,
    total: 25
  },
};

const mockUsers = [
  { _id: 'user-1', fullName: 'Иван Иванов' },
];

describe('NewsList Component (Dashboard)', () => {
  const mockDeleteMutate = vi.fn();
  const mockPublicateMutate = vi.fn();
  const mockOpenModal = vi.fn();

  // Вспомогательная функция настройки моков без единого `any`
  const setupHooks = ({
                        isLoading = false,
                        isError = false,
                        data = mockNewsData as NewsData | undefined,
                      } = {}) => {
    vi.mocked(useNews).mockReturnValue({
      data,
      isLoading,
      isError,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useDeleteNews).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as never);

    vi.mocked(usePublicateNews).mockReturnValue({
      mutate: mockPublicateMutate,
    } as never);

    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useModalStore).mockReturnValue({
      openModal: mockOpenModal,
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupHooks();
  });

  it('отображает заголовок "Новости" и кнопку добавления новости', () => {
    render(<NewsList />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Новости' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Добавить новость/i })
    ).toBeInTheDocument();
  });

  it('отображает сообщение об ошибке, если не удалось загрузить новости (Error state)', () => {
    setupHooks({ isError: true, data: undefined });

    render(<NewsList />);

    expect(screen.getByText('Не удалось загрузить новости')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument();
  });

  it('позволяет вводить текст в поле поиска по новостям', () => {
    render(<NewsList />);

    const searchInput = screen.getByPlaceholderText('Поиск по названию...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Алтай' } });

    expect(searchInput.value).toBe('Алтай');
  });

  it('отображает фильтр по авторам', () => {
    render(<NewsList />);

    expect(screen.getByText('Все авторы')).toBeInTheDocument();
  });

  it('открывает форму добавления новости при клике на "Добавить новость"', async () => {
    render(<NewsList />);

    const addButton = screen.getByRole('button', { name: /Добавить новость/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-news-form')).toBeInTheDocument();
    });
  });

  it('отображает заголовок новости в таблице при успешной загрузке', () => {
    render(<NewsList />);

    expect(screen.getByText('Тестовая новость 1')).toBeInTheDocument();
  });
});