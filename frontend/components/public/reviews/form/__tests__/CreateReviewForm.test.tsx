import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateReviewForm from '../CreateReviewForm';
import { useCreateReview, useUpdateReview } from '@/lib/hooks/reviewHooks';

vi.mock('@/lib/hooks/reviewHooks', () => ({
  useCreateReview: vi.fn(),
  useUpdateReview: vi.fn(),
}));
vi.mock('@/components/shared/PhotoDropzone', () => ({
  default: () => <div data-testid="photo-dropzone" />,
}));
vi.mock('../ReviewerBadge', () => ({
  default: ({ name }: { name: string | null }) => (
    <div data-testid="reviewer-badge">{name}</div>
  ),
}));

const createMutate = vi.fn();
const updateMutate = vi.fn();

const setup = ({
  tourId = 't1',
  isEditing = false,
  reviewId = undefined as string | undefined,
  initialData = undefined as never,
  loading = false,
  onSuccess = vi.fn(),
} = {}) => {
  vi.mocked(useCreateReview).mockReturnValue({
    mutate: createMutate,
    isPending: loading,
  } as never);
  vi.mocked(useUpdateReview).mockReturnValue({
    mutate: updateMutate,
    isPending: false,
  } as never);

  render(
    <CreateReviewForm
      tourId={tourId}
      isEditing={isEditing}
      reviewId={reviewId}
      initialData={initialData}
      onSuccess={onSuccess}
    />,
  );
  return { onSuccess };
};

describe('CreateReviewForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает заголовок создания', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: 'Оставьте ваш отзыв' }),
    ).toBeInTheDocument();
  });

  it('показывает заголовок редактирования', () => {
    setup({ isEditing: true, reviewId: 'r1' });
    expect(
      screen.getByRole('heading', { name: 'Редактировать отзыв' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Сохранить изменения/ }),
    ).toBeInTheDocument();
  });

  it('подставляет начальные данные', () => {
    setup({
      isEditing: true,
      reviewId: 'r1',
      initialData: {
        clientName: 'Иван',
        rating: 4,
        comment: 'Отлично',
      } as never,
    });
    expect(screen.getByDisplayValue('Иван')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Отлично')).toBeInTheDocument();
  });

  it('рендерит рейтинг и дропзону', () => {
    setup();
    expect(screen.getAllByRole('button', { name: 'звезда' })).toHaveLength(5);
    expect(screen.getByTestId('photo-dropzone')).toBeInTheDocument();
  });

  it('требует заполнения полей', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Оставить отзыв/ }),
    );

    await waitFor(() => expect(createMutate).not.toHaveBeenCalled());
  });

  it('отправляет отзыв с tourId', async () => {
    setup();
    await userEvent.click(screen.getAllByRole('button', { name: 'звезда' })[4]);
    await userEvent.type(screen.getByPlaceholderText('Имя'), 'Иван');
    await userEvent.type(
      screen.getByPlaceholderText('Комментарий'),
      'Отличный тур',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /Оставить отзыв/ }),
    );

    await waitFor(() => expect(createMutate).toHaveBeenCalled());
    expect(createMutate.mock.calls[0][0]).toMatchObject({
      clientName: 'Иван',
      rating: 5,
      tourId: 't1',
    });
  });

  it('показывает экран благодарности после отправки', async () => {
    let capturedName = '';

    createMutate.mockImplementation((data, opts) => {
      capturedName = data.clientName;
      queueMicrotask(() => opts?.onSuccess?.());
    });

    setup();

    await userEvent.click(screen.getAllByRole('button', { name: 'звезда' })[4]);
    await userEvent.type(screen.getByPlaceholderText('Имя'), 'Иван');
    await userEvent.type(
      screen.getByPlaceholderText('Комментарий'),
      'Отличный тур',
    );

    await userEvent.click(
      screen.getByRole('button', { name: /Оставить отзыв/ }),
    );

    expect(await screen.findByText('Спасибо за отзыв!')).toBeInTheDocument();

    expect(capturedName).toBe('Иван');
  });

  it('вызывает обновление при редактировании', async () => {
    setup({
      isEditing: true,
      reviewId: 'r1',
      initialData: { clientName: 'Иван', rating: 4, comment: 'Текст' } as never,
    });

    await userEvent.click(
      screen.getByRole('button', { name: /Сохранить изменения/ }),
    );

    await waitFor(() =>
      expect(updateMutate).toHaveBeenCalledWith(
        { id: 'r1', data: expect.objectContaining({ clientName: 'Иван' }) },
        expect.anything(),
      ),
    );
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('не показывает экран благодарности при редактировании', async () => {
    updateMutate.mockImplementation((_d, opts) => opts.onSuccess());
    setup({
      isEditing: true,
      reviewId: 'r1',
      initialData: { clientName: 'Иван', rating: 4, comment: 'Текст' } as never,
    });

    await userEvent.click(
      screen.getByRole('button', { name: /Сохранить изменения/ }),
    );

    await waitFor(() =>
      expect(screen.queryByText('Спасибо за отзыв!')).not.toBeInTheDocument(),
    );
  });

  it('блокирует кнопку при отправке', () => {
    setup({ loading: true });
    expect(
      screen.getByRole('button', { name: /Оставить отзыв/ }),
    ).toBeDisabled();
  });
});
