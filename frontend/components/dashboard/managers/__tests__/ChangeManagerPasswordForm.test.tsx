import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangeManagerPasswordForm } from '../ChangeManagerPasswordForm';
import { useChangeManagerPassword } from '@/lib/hooks/managerHook';
import { useModalStore } from '@/lib/stores/modalStore';

vi.mock('@/lib/hooks/managerHook', () => ({
  useChangeManagerPassword: vi.fn(),
}));
vi.mock('@/lib/stores/modalStore', () => ({ useModalStore: vi.fn() }));

const mutate = vi.fn();
const closeModal = vi.fn();

const setup = (isPending = false) => {
  vi.mocked(useChangeManagerPassword).mockReturnValue({
    mutate,
    isPending,
  } as never);
  vi.mocked(useModalStore).mockReturnValue({ closeModal } as never);
  return render(<ChangeManagerPasswordForm managerId="m1" />);
};

describe('ChangeManagerPasswordForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('рендерит оба поля пароля', () => {
    setup();
    expect(screen.getByLabelText('Новый пароль')).toBeInTheDocument();
    expect(screen.getByLabelText('Подтверждение пароля')).toBeInTheDocument();
  });

  it('требует оба поля', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Изменить пароль' }),
    );

    expect(await screen.findByText('Введите новый пароль')).toBeInTheDocument();
    expect(screen.getByText('Подтвердите пароль')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('проверяет минимальную длину', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Новый пароль'), '123');
    await userEvent.click(
      screen.getByRole('button', { name: 'Изменить пароль' }),
    );

    expect(await screen.findByText('Минимум 6 символов')).toBeInTheDocument();
  });

  it('проверяет совпадение паролей', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Новый пароль'), 'secret123');
    await userEvent.type(
      screen.getByLabelText('Подтверждение пароля'),
      'other123',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Изменить пароль' }),
    );

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('отправляет пароль при совпадении', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Новый пароль'), 'secret123');
    await userEvent.type(
      screen.getByLabelText('Подтверждение пароля'),
      'secret123',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Изменить пароль' }),
    );

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { id: 'm1', password: 'secret123' },
        expect.anything(),
      ),
    );
  });

  it('переключает видимость каждого поля независимо', async () => {
    setup();
    const password = screen.getByLabelText('Новый пароль');
    const confirm = screen.getByLabelText('Подтверждение пароля');
    const toggles = screen.getAllByRole('button').slice(0, 2);

    await userEvent.click(toggles[0]);
    expect(password).toHaveAttribute('type', 'text');
    expect(confirm).toHaveAttribute('type', 'password');
  });

  it('закрывает модалку после успеха', async () => {
    mutate.mockImplementation((_d, opts) => opts.onSuccess());
    setup();
    await userEvent.type(screen.getByLabelText('Новый пароль'), 'secret123');
    await userEvent.type(
      screen.getByLabelText('Подтверждение пароля'),
      'secret123',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Изменить пароль' }),
    );

    await waitFor(() => expect(closeModal).toHaveBeenCalledOnce());
  });

  it('блокирует форму при isPending', () => {
    setup(true);
    expect(screen.getByLabelText('Новый пароль')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'изменение...' })).toBeDisabled();
  });
});
