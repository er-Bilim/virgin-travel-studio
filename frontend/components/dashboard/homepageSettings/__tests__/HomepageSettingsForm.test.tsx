import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomepageSettingsForm from '../HomepageSettingsForm';
import {
  useHomepageSettings,
  mutateCreateHomepageSettings,
  mutateHomepageSettings,
} from '@/lib/hooks/homepageSettingsHooks';
import { toast } from 'sonner';

vi.mock('@/lib/hooks/homepageSettingsHooks', () => ({
  useHomepageSettings: vi.fn(),
  mutateCreateHomepageSettings: vi.fn(),
  mutateHomepageSettings: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../VideoInput', () => ({
  VideoInput: () => <div data-testid="video-input" />,
}));
vi.mock('../advantages/advantageItem', () => ({
  default: () => <div data-testid="advantage-item" />,
}));

const createMutate = vi.fn();
const updateMutate = vi.fn();

const settings = {
  hero: { title: 'Путешествуй с нами', subtitle: 'Описание' },
  mainPopularTours: { title: 'Популярные', subtitle: '' },
  mainLatestNews: { title: 'Новости', subtitle: '' },
  reviewsPage: { title: 'Отзывы', subtitle: '' },
  toursPage: { badge: 'Каталог', title: 'Туры', subtitle: '' },
  newsPage: { badge: 'Блог', title: 'Новости', subtitle: '' },
  advantages: [],
};

const setup = ({
  data = settings as never,
  isFetching = false,
  isSaving = false,
} = {}) => {
  vi.mocked(useHomepageSettings).mockReturnValue({
    data,
    isPending: isFetching,
  } as never);
  vi.mocked(mutateCreateHomepageSettings).mockReturnValue({
    mutate: createMutate,
    isPending: isSaving,
  } as never);
  vi.mocked(mutateHomepageSettings).mockReturnValue({
    mutate: updateMutate,
    isPending: isSaving,
  } as never);

  return render(<HomepageSettingsForm />);
};

describe('HomepageSettingsForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает спиннер при загрузке', () => {
    setup({ isFetching: true });
    expect(
      screen.getByText('Загрузка структуры страниц...'),
    ).toBeInTheDocument();
  });

  it('по умолчанию открыта вкладка "Главный экран"', () => {
    setup();
    expect(screen.getByText('Контент первого экрана')).toBeInTheDocument();
    expect(screen.getByTestId('video-input')).toBeInTheDocument();
  });

  it('переключает на вкладку секций', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Главная: Секции/ }),
    );

    expect(
      await screen.findByText('Блок популярных туров'),
    ).toBeInTheDocument();
    expect(screen.getByText('Блок отзывов')).toBeInTheDocument();
  });

  it('переключает на вкладку внутренних баннеров', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Внутренние баннеры/ }),
    );

    expect(
      await screen.findByText('Баннер страницы туров'),
    ).toBeInTheDocument();
    expect(screen.getByText('Баннер страницы новостей')).toBeInTheDocument();
  });

  it('требует заголовок hero', async () => {
    setup({
      data: { ...settings, hero: { title: '', subtitle: '' } } as never,
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить настройки страниц' }),
    );

    expect(
      await screen.findByText('Главный заголовок на видео обязателен'),
    ).toBeInTheDocument();
  });

  it('открывает диалог подтверждения перед сохранением', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить настройки страниц' }),
    );

    expect(
      await screen.findByText('Сохранить изменения контента?'),
    ).toBeInTheDocument();
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it('сохраняет после подтверждения', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить настройки страниц' }),
    );
    await screen.findByText('Сохранить изменения контента?');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => expect(updateMutate).toHaveBeenCalled());
  });

  it('вызывает создание при отсутствии настроек', async () => {
    setup({ data: null as never });
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить настройки страниц' }),
    );

    await waitFor(() =>
      expect(
        screen.queryByText('Сохранить изменения контента?'),
      ).toBeInTheDocument(),
    );
  });

  it('показывает тост об успехе', async () => {
    updateMutate.mockImplementation((_d, opts) => opts.onSuccess());
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить настройки страниц' }),
    );
    await screen.findByText('Сохранить изменения контента?');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Данные обновились!',
        expect.anything(),
      ),
    );
  });

  it('показывает ошибку при отсутствии ответа сервера', async () => {
    updateMutate.mockImplementation((_d, opts) =>
      opts.onError({ response: undefined }),
    );
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить настройки страниц' }),
    );
    await screen.findByText('Сохранить изменения контента?');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(
      await screen.findByText(
        'Сервер не отвечает. Проверьте интернет-соединение.',
      ),
    ).toBeInTheDocument();
  });

  it('добавляет преимущество', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Главная: Секции/ }),
    );
    await screen.findByText('Блок преимуществ');

    await userEvent.click(
      screen.getByRole('button', { name: /Добавить преимущество/ }),
    );

    expect(await screen.findByTestId('advantage-item')).toBeInTheDocument();
  });
});
