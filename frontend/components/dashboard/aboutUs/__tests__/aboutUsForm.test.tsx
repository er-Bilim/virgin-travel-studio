import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AboutUsForm from '../aboutUsForm';
import { useEditAboutUsData, useCreateAboutUsData } from '@/lib/hooks/aboutUs';
import { toast } from 'sonner';

vi.mock('@/lib/hooks/aboutUs', () => ({
  useEditAboutUsData: vi.fn(),
  useCreateAboutUsData: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const editMutate = vi.fn();
const createMutate = vi.fn();

const initialValues = {
  pageTitle: 'О нас',
  description: 'Описание',
  contentBlocks: [
    { title: 'A', body: 'a' },
    { title: 'B', body: 'b' },
    { title: 'C', body: 'c' },
  ],
  missionTitle: 'Миссия',
  missionBody: 'Текст миссии',
  ideaLabel: 'Наша идея',
  ideaTitle: 'Идея',
  ideaDescription: 'Описание идеи',
  ideaBlocks: [
    { title: 'I1', body: 'i1' },
    { title: 'I2', body: 'i2' },
  ],
  heroCardTitle: 'Заголовок',
  heroCardBody: 'Текст',
  steps: ['Шаг 1'],
};

const setup = ({
  values = initialValues as never,
  isLoading = false,
  errorLoad = null as Error | null,
  isPending = false,
} = {}) => {
  vi.mocked(useEditAboutUsData).mockReturnValue({
    mutate: editMutate,
    isPending,
  } as never);
  vi.mocked(useCreateAboutUsData).mockReturnValue({
    mutate: createMutate,
    isPending,
  } as never);

  return render(
    <AboutUsForm
      initialValues={values}
      isLoading={isLoading}
      errorLoad={errorLoad}
    />,
  );
};

describe('AboutUsForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает лоадер', () => {
    const { container } = setup({ isLoading: true });
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('показывает ошибку загрузки', () => {
    setup({ errorLoad: new Error('Не удалось загрузить') });
    expect(screen.getByText('Не удалось загрузить')).toBeInTheDocument();
  });

  it('подставляет начальные значения', () => {
    setup();
    expect(screen.getByDisplayValue('О нас')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Миссия')).toBeInTheDocument();
  });

  it('рендерит три блока преимуществ', () => {
    const { container } = setup();
    expect(
      container.querySelectorAll('input[name^="contentBlocks"]').length,
    ).toBe(3);
  });

  it('рендерит два блока идеи', () => {
    const { container } = setup();
    expect(container.querySelectorAll('input[name^="ideaBlocks"]').length).toBe(
      2,
    );
  });

  it('дополняет блоки до нужного количества', () => {
    const { container } = setup({
      values: { ...initialValues, contentBlocks: [] } as never,
    });
    expect(
      container.querySelectorAll('input[name^="contentBlocks"]').length,
    ).toBe(3);
  });

  it('требует обязательные поля', async () => {
    setup({
      values: { ...initialValues, pageTitle: '', description: '' } as never,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByText('Введите Заголовок')).toBeInTheDocument();
    expect(screen.getByText('Введите описание')).toBeInTheDocument();
    expect(editMutate).not.toHaveBeenCalled();
  });

  it('добавляет шаг', async () => {
    const { container } = setup();
    await userEvent.click(screen.getByRole('button', { name: /Добавить шаг/ }));

    await waitFor(() =>
      expect(container.querySelectorAll('input[name^="steps"]').length).toBe(2),
    );
  });

  it('удаляет шаг', async () => {
    const { container } = setup({
      values: { ...initialValues, steps: ['Шаг 1', 'Шаг 2'] } as never,
    });
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Удалить' })[0],
    );

    await waitFor(() =>
      expect(container.querySelectorAll('input[name^="steps"]').length).toBe(1),
    );
  });

  it('отправляет данные', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => expect(editMutate).toHaveBeenCalled());
    expect(editMutate.mock.calls[0][0].pageTitle).toBe('О нас');
  });

  it('показывает тост об успехе', async () => {
    editMutate.mockImplementation((_d, opts) => opts.onSuccess());
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Обновили данные',
        expect.anything(),
      ),
    );
  });

  it('показывает тост об ошибке', async () => {
    editMutate.mockImplementation((_d, opts) =>
      opts.onError({ message: 'Сбой' }),
    );
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Сбой'),
        expect.anything(),
      ),
    );
  });

  it('блокирует кнопку при сохранении', () => {
    setup({ isPending: true });
    expect(screen.getByRole('button', { name: /Сохранение/ })).toBeDisabled();
  });
});
