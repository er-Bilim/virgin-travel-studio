import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Faq } from '@/types/faq';
import { useSortable } from '@dnd-kit/sortable';
import {
  SortableFaqItem
} from "@/components/dashboard/faqSettings/SortableFaqItem";

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => 'translate3d(0, 0, 0)'),
    },
  },
}));

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();
const mockOnTogglePublish = vi.fn();

const mockFaqPublished: Faq = {
  _id: 'faq-1',
  question: 'Как забронировать тур?',
  answer: 'Выберите тур и нажмите Забронировать.',
  isPublished: true,
  order: 1,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockFaqDraft: Faq = {
  ...mockFaqPublished,
  _id: 'faq-2',
  isPublished: false,
};

const setup = ({
                 faq = mockFaqPublished,
                 isReorderMode = false,
                 isDragging = false,
               } = {}) => {
  vi.mocked(useSortable).mockReturnValue({
    attributes: { role: 'button' } as never,
    listeners: { onMouseDown: vi.fn() } as never,
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging,
  } as never);

  return render(
    <SortableFaqItem
      faq={faq}
      isReorderMode={isReorderMode}
      onEdit={mockOnEdit}
      onDelete={mockOnDelete}
      onTogglePublish={mockOnTogglePublish}
    />,
  );
};

describe('SortableFaqItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает вопрос, ответ и кнопки действий в обычном режиме', () => {
    setup();

    expect(screen.getByText('Как забронировать тур?')).toBeInTheDocument();
    expect(
      screen.getByText('Выберите тур и нажмите Забронировать.'),
    ).toBeInTheDocument();

    expect(screen.getByTitle('В черновик')).toBeInTheDocument();
    expect(screen.getByTitle('Редактировать')).toBeInTheDocument();
    expect(screen.getByTitle('Удалить')).toBeInTheDocument();
  });

  it('показывает статус и заголовок "Опубликовать" для черновика', () => {
    setup({ faq: mockFaqDraft });

    expect(screen.getByTitle('Опубликовать')).toBeInTheDocument();
    expect(screen.queryByTitle('В черновик')).not.toBeInTheDocument();
  });

  it('вызывает соответствующие колбэки при клике на кнопки действий', async () => {
    setup();

    await userEvent.click(screen.getByTitle('В черновик'));
    expect(mockOnTogglePublish).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByTitle('Редактировать'));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByTitle('Удалить'));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('скрывает кнопки действий и отображает элемент перетаскивания в режиме сортировки', () => {
    setup({ isReorderMode: true });

    expect(screen.queryByTitle('В черновик')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Редактировать')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Удалить')).not.toBeInTheDocument();

    expect(useSortable).toHaveBeenCalledWith({
      id: 'faq-1',
      disabled: false,
    });
  });
});