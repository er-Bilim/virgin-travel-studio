import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateManagerForm } from '../CreateManagerForm';
import { useCreateManager } from '@/lib/hooks/managerHook';
import { useModalStore } from '@/lib/stores/modalStore';

vi.mock('@/lib/hooks/managerHook', () => ({ useCreateManager: vi.fn() }));
vi.mock('@/lib/stores/modalStore', () => ({ useModalStore: vi.fn() }));

const mutate = vi.fn();
const closeModal = vi.fn();

const setup = (isPending = false) => {
  vi.mocked(useCreateManager).mockReturnValue({ mutate, isPending } as never);
  vi.mocked(useModalStore).mockReturnValue({ closeModal } as never);
  return render(<CreateManagerForm />);
};

const fill = async () => {
  await userEvent.type(
    screen.getByLabelText('Личные данные ФИО'),
    'Иван Петров',
  );
  await userEvent.type(screen.getByLabelText('Телефон'), '+996700000000');
  await userEvent.type(screen.getByLabelText('Пароль'), 'secret123');
};

describe('CreateManagerForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('рендерит все поля', () => {
    setup();
    expect(screen.getByLabelText('Личные данные ФИО')).toBeInTheDocument();
    expect(screen.getByLabelText('Телефон')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
  });

  it('требует все обязательные поля', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать менеджера' }),
    );

    expect(await screen.findByText('Введите имя')).toBeInTheDocument();
    expect(screen.getByText('Введите номер телефона')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('проверяет минимальную длину имени', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Личные данные ФИО'), 'И');
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать менеджера' }),
    );

    expect(
      await screen.findByText('Имя должно содержать не менее 2 символов'),
    ).toBeInTheDocument();
  });

  it('проверяет формат телефона', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Телефон'), 'abc');
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать менеджера' }),
    );

    expect(
      await screen.findByText('Некорректный номер телефона'),
    ).toBeInTheDocument();
  });

  it('проверяет минимальную длину пароля', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Пароль'), '123');
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать менеджера' }),
    );

    expect(await screen.findByText('Минимум 6 символов')).toBeInTheDocument();
  });

  it('переключает видимость пароля', async () => {
    setup();
    const password = screen.getByLabelText('Пароль');
    expect(password).toHaveAttribute('type', 'password');

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);
    expect(password).toHaveAttribute('type', 'text');
  });

  it('отправляет данные менеджера', async () => {
    setup();
    await fill();
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать менеджера' }),
    );

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          fullName: 'Иван Петров',
          phone: '+996700000000',
          password: 'secret123',
        },
        expect.anything(),
      ),
    );
  });

  it('закрывает модалку после успеха', async () => {
    mutate.mockImplementation((_d, opts) => opts.onSuccess());
    setup();
    await fill();
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать менеджера' }),
    );

    await waitFor(() => expect(closeModal).toHaveBeenCalledOnce());
  });

  it('блокирует форму при isPending', () => {
    setup(true);
    expect(screen.getByLabelText('Телефон')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'создание...' })).toBeDisabled();
  });
});
