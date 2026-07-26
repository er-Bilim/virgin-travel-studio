import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FaqManagement from '../FaqManagement';
import { useModalStore } from '@/lib/stores/modalStore';
import {
  useAdminFaqs,
  mutateDeleteFaq,
  mutateTogglePublishFaq,
  mutateReorderFaqs,
} from '@/lib/hooks/faq';
import type { Faq } from '@/types/faq';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/stores/modalStore', () => ({
  useModalStore: vi.fn(),
}));

vi.mock('@/lib/hooks/faq', () => ({
  useAdminFaqs: vi.fn(),
  mutateDeleteFaq: vi.fn(),
  mutateTogglePublishFaq: vi.fn(),
  mutateReorderFaqs: vi.fn(),
}));

vi.mock('@/components/dashboard/faqSettings/SortableFaqItem', () => ({
  SortableFaqItem: ({ faq }: { faq: Faq }) => (
    <div data-testid="sortable-faq-item">{faq.question}</div>
  ),
}));

vi.mock('@/components/dashboard/faqSettings/FaqForm', () => ({
  FaqForm: () => <div data-testid="faq-form">Faq Form Component</div>,
}));

const mockFaqs: Faq[] = [
  {
    _id: 'faq-1',
    question: 'Как забронировать тур?',
    answer: 'Выберите тур на сайте.',
    isPublished: true,
    order: 1,
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: '2024-01-01T12:00:00.000Z',
  },
  {
    _id: 'faq-2',
    question: 'Какие документы нужны?',
    answer: 'Нужен загранпаспорт.',
    isPublished: false,
    order: 2,
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: '2024-01-01T12:00:00.000Z',
  },
];

describe('FaqManagement Component (Dashboard)', () => {
  const mockOpenModal = vi.fn();
  const mockDeleteMutate = vi.fn();
  const mockTogglePublishMutate = vi.fn();
  const mockReorderMutate = vi.fn();

  const setupHooks = ({
                        isPending = false,
                        data = mockFaqs as Faq[] | undefined,
                      } = {}) => {
    vi.mocked(useModalStore).mockReturnValue({
      openModal: mockOpenModal,
      closeModal: vi.fn(),
    } as never);

    vi.mocked(useAdminFaqs).mockReturnValue({
      data,
      isPending,
    } as never);

    vi.mocked(mutateDeleteFaq).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as never);

    vi.mocked(mutateTogglePublishFaq).mockReturnValue({
      mutate: mockTogglePublishMutate,
      isPending: false,
    } as never);

    vi.mocked(mutateReorderFaqs).mockReturnValue({
      mutate: mockReorderMutate,
      isPending: false,
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupHooks();
  });

  it('показывает индикатор загрузки, пока загружаются вопросы (Loading state)', () => {
    setupHooks({ isPending: true, data: undefined });

    render(<FaqManagement />);

    expect(screen.getByText('Загрузка вопросов FAQ...')).toBeInTheDocument();
  });

  it('показывает блок с сообщением о пустом списке, если вопросов нет (Empty state)', () => {
    setupHooks({ isPending: false, data: [] });

    render(<FaqManagement />);

    expect(screen.getByText('Список вопросов пуст')).toBeInTheDocument();
  });

  it('отображает список вопросов при успешной загрузке данных', () => {
    render(<FaqManagement />);

    const items = screen.getAllByTestId('sortable-faq-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('Как забронировать тур?')).toBeInTheDocument();
    expect(screen.getByText('Какие документы нужны?')).toBeInTheDocument();
  });

  it('вызывает функцию открытия модалки при клике на "Добавить вопрос"', async () => {
    const user = userEvent.setup();

    render(<FaqManagement />);

    const addButton = screen.getByRole('button', { name: /Добавить вопрос/i });
    await user.click(addButton);

    expect(mockOpenModal).toHaveBeenCalledWith('faqForm');
  });

  it('переключает интерфейс в режим перетаскивания и изменения порядка при клике на "Изменить порядок"', async () => {
    const user = userEvent.setup();

    render(<FaqManagement />);

    const reorderButton = screen.getByRole('button', { name: /Изменить порядок/i });
    await user.click(reorderButton);

    expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Сохранить порядок/i })).toBeInTheDocument();
  });
});