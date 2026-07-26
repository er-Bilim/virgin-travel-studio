import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useModalStore } from '@/lib/stores/modalStore';
import {
  useAdminReviews,
  useDeleteReview,
  useUpdateReview,
} from '@/lib/hooks/reviewHooks';
import TourSetReviewsManager
  from "@/components/dashboard/tourSets/TourSetReviewsManager";

vi.mock('@/lib/stores/modalStore', () => ({
  useModalStore: vi.fn(),
}));

vi.mock('@/lib/hooks/reviewHooks', () => ({
  useAdminReviews: vi.fn(),
  useDeleteReview: vi.fn(),
  useUpdateReview: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

vi.mock('@/components/shared/Modal', () => ({
  Modal: ({ children, id, title }: any) => (
    <div data-testid={`modal-${id}`} data-title={title}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/dashboard/ConfirmDialog/ConfirmDialog', () => ({
  ConfirmDialog: ({ open, onConfirmAction, onCancelAction, title }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <span>{title}</span>
        <button onClick={onConfirmAction}>Подтвердить удаление</button>
        <button onClick={onCancelAction}>Отмена</button>
      </div>
    ) : null,
}));

vi.mock('@/components/public/reviews/form/CreateReviewForm', () => ({
  default: () => <div data-testid="create-review-form" />,
}));

const openModalMock = vi.fn();
const closeModalMock = vi.fn();
const deleteReviewMock = vi.fn();
const updateReviewMock = vi.fn();

const mockReviews = [
  {
    _id: 'rev-1',
    clientName: 'Иван Иванов',
    rating: 5,
    comment: 'Прекрасный тур!',
    image: 'review1.jpg',
    companyReply: null,
  },
  {
    _id: 'rev-2',
    clientName: 'Анна Петрова',
    rating: 4,
    comment: 'В целом понравилось',
    image: null,
    companyReply: 'Спасибо за ваш отзыв!',
  },
];

const setup = ({
                 isLoading = false,
                 isError = false,
                 reviews = mockReviews as never,
                 isDeleting = false,
                 updatingReply = false,
               } = {}) => {
  vi.mocked(useModalStore).mockReturnValue({
    openModal: openModalMock,
    closeModal: closeModalMock,
  } as never);

  vi.mocked(useAdminReviews).mockReturnValue({
    data: { reviews },
    isLoading,
    isError,
  } as never);

  vi.mocked(useDeleteReview).mockReturnValue({
    mutate: deleteReviewMock,
    isPending: isDeleting,
  } as never);

  vi.mocked(useUpdateReview).mockReturnValue({
    mutate: updateReviewMock,
    isPending: updatingReply,
  } as never);

  return render(<TourSetReviewsManager tourId="tour-123" />);
};

describe('TourSetReviewsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает состояние загрузки', () => {
    setup({ isLoading: true });

    expect(screen.getByText('Загрузка отзывов...')).toBeInTheDocument();
  });

  it('отображает сообщение об ошибке', () => {
    setup({ isError: true });

    expect(
      screen.getByText('Не удалось загрузить отзывы.'),
    ).toBeInTheDocument();
  });

  it('отображает пустой список отзывов', () => {
    setup({ reviews: [] as never });

    expect(
      screen.getByText('Для этого тура пока нет отзывов.'),
    ).toBeInTheDocument();
  });

  it('отображает список отзывов, фото и ответы компании', () => {
    setup();

    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('Прекрасный тур!')).toBeInTheDocument();
    expect(
      screen.getByAltText('Фото отзыва Иван Иванов'),
    ).toBeInTheDocument();

    expect(screen.getByText('Анна Петрова')).toBeInTheDocument();
    expect(screen.getByText('В целом понравилось')).toBeInTheDocument();
    expect(screen.getByText('Ответ Virgin Travel')).toBeInTheDocument();
    expect(screen.getByText('Спасибо за ваш отзыв!')).toBeInTheDocument();
  });

  it('открывает модальное окно добавления отзыва при клике', async () => {
    setup();

    const addReviewButton = screen.getByRole('button', {
      name: /Добавить отзыв/i,
    });
    await userEvent.click(addReviewButton);

    expect(openModalMock).toHaveBeenCalledWith('add-tour-review-modal');
  });

  it('открывает модальное окно ответа и сохраняет ответ компании', async () => {
    updateReviewMock.mockImplementation((_args, opts) => opts?.onSuccess?.());
    setup();

    const replyButtons = screen.getAllByRole('button', {
      name: /Ответить от Virgin Travel|Редактировать ответ/i,
    });
    await userEvent.click(replyButtons[0]);

    expect(openModalMock).toHaveBeenCalledWith('reply-tour-review-modal');

    const textarea = screen.getByPlaceholderText('Введите ответ компании...');
    await userEvent.type(textarea, 'Благодарим за выбор нашей компании!');

    const saveButton = screen.getByRole('button', { name: 'Сохранить ответ' });
    await userEvent.click(saveButton);

    expect(updateReviewMock).toHaveBeenCalledWith(
      {
        id: 'rev-1',
        data: { companyReply: 'Благодарим за выбор нашей компании!' },
      },
      expect.anything(),
    );

    await waitFor(() => {
      expect(closeModalMock).toHaveBeenCalled();
    });
  });

  it('удаляет ответ компании при клике на Удалить ответ', async () => {
    setup();

    const deleteReplyButton = screen.getByRole('button', {
      name: 'Удалить ответ',
    });
    await userEvent.click(deleteReplyButton);

    expect(updateReviewMock).toHaveBeenCalledWith({
      id: 'rev-2',
      data: { companyReply: '' },
    });
  });

  it('открывает диалог подтверждения и удаляет отзыв', async () => {
    deleteReviewMock.mockImplementation((_id, opts) => opts?.onSuccess?.());
    setup();

    const deleteButtons = screen.getAllByRole('button', { name: /Удалить/i });
    await userEvent.click(deleteButtons[0]);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByText('Удалить отзыв?')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', {
      name: 'Подтвердить удаление',
    });
    await userEvent.click(confirmButton);

    expect(deleteReviewMock).toHaveBeenCalledWith('rev-1', expect.anything());
  });
});