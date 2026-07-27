import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactSettingsForm from '../contactForm';
import {
  useContacts,
  useMutateContacts,
  useMutateCreateContacts,
} from '@/lib/hooks/contactSettings';
import type { IContactSettings } from '@/types/contactSettings';

vi.mock('@/lib/hooks/contactSettings', () => ({
  useContacts: vi.fn(),
  useMutateContacts: vi.fn(),
  useMutateCreateContacts: vi.fn(),
}));

const updateMutate = vi.fn();
const createMutate = vi.fn();

const existing = {
  phone: '+996703754456',
  email: 'virgin.travel@agency.com',
  address: 'г. Бишкек, ул. 7 апреля, д. 94',
  whatsapp: '+996703754456',
  telegram: '@virgin',
  instagram: 'https://instagram.com/virgin',
  facebook: '',
  mapEmbedUrl: '',
  logo: 'logo.png',
  workingHours: {
    weekdays: { from: '09:00', to: '18:00' },
    saturday: { from: '10:00', to: '15:00', isClosed: false },
    sunday: { from: '', to: '', isClosed: true },
  },
} as unknown as IContactSettings;

const setup = ({
  data = existing,
  isPending = false,
  isFetching = false,
  error = null,
}: {
  data?: IContactSettings | null;
  isPending?: boolean;
  isFetching?: boolean;
  error?: unknown;
} = {}) => {
  vi.mocked(useContacts).mockReturnValue({
    data,
    isPending: isFetching,
    error,
  } as never);
  vi.mocked(useMutateContacts).mockReturnValue({
    mutate: updateMutate,
    isPending,
  } as never);
  vi.mocked(useMutateCreateContacts).mockReturnValue({
    mutate: createMutate,
    isPending,
  } as never);

  return render(<ContactSettingsForm />);
};

const field = (container: HTMLElement, name: string) =>
  container.querySelector(`[name="${name}"]`) as HTMLInputElement;

describe('ContactSettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('подставляет значения из загруженных настроек', async () => {
    const { container } = setup();

    await waitFor(() => {
      expect(field(container, 'phone')).toHaveValue('+996703754456');
    });
    expect(field(container, 'email')).toHaveValue('virgin.travel@agency.com');
    expect(field(container, 'address')).toHaveValue(
      'г. Бишкек, ул. 7 апреля, д. 94',
    );
  });

  it('рендерит все поля контактов', () => {
    const { container } = setup();
    [
      'phone',
      'email',
      'address',
      'whatsapp',
      'telegram',
      'instagram',
      'facebook',
      'mapEmbedUrl',
      'logo',
    ].forEach((name) => expect(field(container, name)).toBeInTheDocument());
  });

  it('показывает текущий логотип, если он строка', () => {
    setup();
    expect(screen.getByText('Текущий логотип:')).toBeInTheDocument();
    expect(screen.getByAltText('Логотип')).toBeInTheDocument();
  });

  it('не показывает логотип, если его нет', () => {
    setup({ data: { ...existing, logo: '' } as IContactSettings });
    expect(screen.queryByAltText('Текущий логотип')).not.toBeInTheDocument();
  });

  it('показывает спиннер при загрузке', () => {
    const { container } = setup({ isFetching: true });
    expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();
  });

  it('показывает ошибку загрузки', () => {
    setup({ error: new Error('fail') });
    expect(
      screen.getByText(/Ошибка при загрузке контактов/),
    ).toBeInTheDocument();
  });

  describe('валидация', () => {
    it('требует телефон, email и адрес', async () => {
      const { container } = setup({ data: null });

      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      expect(await screen.findByText('Введите телефон')).toBeInTheDocument();
      expect(screen.getByText('Введите email')).toBeInTheDocument();
      expect(screen.getByText('Введите адрес')).toBeInTheDocument();
      expect(createMutate).not.toHaveBeenCalled();
      expect(field(container, 'phone')).toBeInTheDocument();
    });

    it('проверяет формат email', async () => {
      const { container } = setup({ data: null });

      await userEvent.type(field(container, 'phone'), '+996700000000');
      await userEvent.type(field(container, 'email'), 'не-email');
      await userEvent.type(field(container, 'address'), 'Адрес');
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      expect(
        await screen.findByText('Неверный формат email'),
      ).toBeInTheDocument();
    });

    it('отклоняет whatsapp в неверном формате', async () => {
      const { container } = setup();

      await userEvent.clear(field(container, 'whatsapp'));
      await userEvent.type(field(container, 'whatsapp'), '12345');
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      expect(
        await screen.findByText('Номер должен начинаться с +996 или 0'),
      ).toBeInTheDocument();
    });

    it('принимает whatsapp в формате 0XXXXXXXXX', async () => {
      const { container } = setup();

      await userEvent.clear(field(container, 'whatsapp'));
      await userEvent.type(field(container, 'whatsapp'), '0700123456');
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      await waitFor(() => expect(updateMutate).toHaveBeenCalled());
    });

    it('принимает пустой whatsapp', async () => {
      const { container } = setup();

      await userEvent.clear(field(container, 'whatsapp'));
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      await waitFor(() => expect(updateMutate).toHaveBeenCalled());
    });
  });

  describe('отправка', () => {
    it('вызывает обновление при существующих настройках', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      await waitFor(() => expect(updateMutate).toHaveBeenCalledOnce());
      expect(createMutate).not.toHaveBeenCalled();
    });

    it('вызывает создание, если настроек нет', async () => {
      const { container } = setup({ data: null });

      await userEvent.type(field(container, 'phone'), '+996700000000');
      await userEvent.type(field(container, 'email'), 'a@b.kg');
      await userEvent.type(field(container, 'address'), 'Адрес');
      await userEvent.type(
        field(container, 'workingHours.weekdays.from'),
        '09:00',
      );
      await userEvent.type(
        field(container, 'workingHours.weekdays.to'),
        '18:00',
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      await waitFor(() => expect(createMutate).toHaveBeenCalledOnce());
      expect(updateMutate).not.toHaveBeenCalled();
    });

    it('отправляет FormData с основными полями', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      await waitFor(() => expect(updateMutate).toHaveBeenCalled());
      const formData = updateMutate.mock.calls[0][0] as FormData;

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('phone')).toBe('+996703754456');
      expect(formData.get('email')).toBe('virgin.travel@agency.com');
      expect(formData.get('workingHours')).toContain('weekdays');
    });

    it('обнуляет часы выходного дня перед отправкой', async () => {
      setup();
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      await waitFor(() => expect(updateMutate).toHaveBeenCalled());
      const formData = updateMutate.mock.calls[0][0] as FormData;
      const hours = JSON.parse(formData.get('workingHours') as string);

      expect(hours.sunday).toEqual({ isClosed: true, from: '', to: '' });
    });
  });

  describe('рабочие часы', () => {
    it('блокирует поля времени при отметке "Выходной"', async () => {
      const { container } = setup();

      expect(field(container, 'workingHours.sunday.from')).toBeDisabled();
      expect(field(container, 'workingHours.saturday.from')).not.toBeDisabled();
    });

    it('очищает время при включении выходного', async () => {
      const { container } = setup();
      const checkboxes = screen.getAllByRole('checkbox');

      await userEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(field(container, 'workingHours.saturday.from')).toHaveValue('');
      });
    });

    it('требует время для будней', async () => {
      const { container } = setup({ data: null });

      await userEvent.type(field(container, 'phone'), '+996700000000');
      await userEvent.type(field(container, 'email'), 'a@b.kg');
      await userEvent.type(field(container, 'address'), 'Адрес');
      await userEvent.click(
        screen.getByRole('button', { name: 'Сохранить изменения' }),
      );

      expect((await screen.findAllByText('Обязательное поле')).length).toBe(2);
    });
  });

  describe('состояние сохранения', () => {
    it('блокирует форму и показывает индикатор', () => {
      const { container } = setup({ isPending: true });

      expect(field(container, 'phone')).toBeDisabled();
      expect(screen.getByText('Сохранение...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
