import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateNewsForm from '../CreateNewsForm';
import useCreateNews, { useEditNews } from '@/lib/hooks/newsHooks';

vi.mock('@/lib/hooks/newsHooks', () => ({
  default: vi.fn(),
  useEditNews: vi.fn(),
}));
vi.mock('@/components/dashboard/FileInput/FileInput', () => ({
  default: () => <div data-testid="file-input" />,
}));

const createNews = vi.fn();
const editNews = vi.fn();

const setup = ({
  isEdit = false,
  editedId = undefined as string | undefined,
  initialValues = undefined as never,
  onSuccess = vi.fn(),
  isPending = false,
} = {}) => {
  vi.mocked(useCreateNews).mockReturnValue({
    mutate: createNews,
    isPending,
  } as never);
  vi.mocked(useEditNews).mockReturnValue({
    mutate: editNews,
    isPending: false,
  } as never);

  render(
    <CreateNewsForm
      isEdit={isEdit}
      editedId={editedId}
      initialValues={initialValues}
      onSuccess={onSuccess}
    />,
  );
  return { onSuccess };
};

describe('CreateNewsForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает заголовок создания', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: 'Создать новости' }),
    ).toBeInTheDocument();
  });

  it('показывает заголовок редактирования', () => {
    setup({ isEdit: true, editedId: 'n1' });
    expect(
      screen.getByRole('heading', { name: 'Редактировать' }),
    ).toBeInTheDocument();
  });

  it('требует заголовок и контент', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать новости' }),
    );

    expect(await screen.findByText('Заголовок обязателен')).toBeInTheDocument();
    expect(screen.getByText('Контент обязателен')).toBeInTheDocument();
    expect(createNews).not.toHaveBeenCalled();
  });

  it('добавляет тэг', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /Добавить тэг/ }));

    expect(
      await screen.findByPlaceholderText('Введите тэг'),
    ).toBeInTheDocument();
  });

  it('удаляет тэг', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /Добавить тэг/ }));
    await screen.findByPlaceholderText('Введите тэг');

    await userEvent.click(screen.getByRole('button', { name: 'Убрать тэг' }));

    await waitFor(() =>
      expect(
        screen.queryByPlaceholderText('Введите тэг'),
      ).not.toBeInTheDocument(),
    );
  });

  it('требует непустой тэг', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /Добавить тэг/ }));
    await screen.findByPlaceholderText('Введите тэг');
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать новости' }),
    );

    expect(
      await screen.findByText('Тэг не может быть пустым'),
    ).toBeInTheDocument();
  });

  it('преобразует тэги в массив строк при отправке', async () => {
    setup();
    await userEvent.type(
      screen.getByPlaceholderText('Заголовок новости'),
      'Новость',
    );
    await userEvent.type(
      screen.getByPlaceholderText(/О чем эта новость/),
      'Текст',
    );
    await userEvent.click(screen.getByRole('button', { name: /Добавить тэг/ }));
    await userEvent.type(
      await screen.findByPlaceholderText('Введите тэг'),
      'турция',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать новости' }),
    );

    await waitFor(() => expect(createNews).toHaveBeenCalled());
    expect(createNews.mock.calls[0][0].tags).toEqual(['турция']);
  });

  it('вызывает редактирование с id', async () => {
    setup({
      isEdit: true,
      editedId: 'n1',
      initialValues: {
        title: 'Старая',
        content: 'Текст',
        image: null,
        tags: [],
      } as never,
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать новости' }),
    );

    await waitFor(() =>
      expect(editNews).toHaveBeenCalledWith(
        { id: 'n1', data: expect.objectContaining({ title: 'Старая' }) },
        expect.anything(),
      ),
    );
  });

  it('вызывает onSuccess после создания', async () => {
    createNews.mockImplementation((_d, opts) => opts.onSuccess());
    const { onSuccess } = setup();

    await userEvent.type(
      screen.getByPlaceholderText('Заголовок новости'),
      'Новость',
    );
    await userEvent.type(
      screen.getByPlaceholderText(/О чем эта новость/),
      'Текст',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать новости' }),
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it('блокирует кнопку при отправке', () => {
    setup({ isPending: true });
    expect(screen.getByRole('button', { name: 'Создать...' })).toBeDisabled();
  });
});
