import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpdateManagerForm } from '../UpdateManagerForm';
import { useUpdateManager } from '@/lib/hooks/managerHook';
import type { IUser } from '@/types/user';

vi.mock('@/lib/hooks/managerHook', () => ({ useUpdateManager: vi.fn() }));

const update = vi.fn();

const initialValues = {
  _id: 'm1',
  fullName: 'Иван Петров',
  phone: '+996700000000',
  status: 'active',
} as unknown as IUser;

const setup = (isUpdating = false, values = initialValues) => {
  vi.mocked(useUpdateManager).mockReturnValue({
    mutate: update,
    isPending: isUpdating,
  } as never);
  return render(<UpdateManagerForm initialValues={values} />);
};

describe('UpdateManagerForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('подставляет начальные значения', () => {
    setup();
    expect(screen.getByDisplayValue('Иван Петров')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+996700000000')).toBeInTheDocument();
  });

  it('рендерит переключатели статуса', () => {
    setup();
    expect(screen.getByLabelText('Активный')).toBeInTheDocument();
    expect(screen.getByLabelText('Бан')).toBeInTheDocument();
  });

  it('отмечает текущий статус', () => {
    setup();
    expect(screen.getByLabelText('Активный')).toBeChecked();
  });

  it('требует имя и телефон', async () => {
    setup(false, { ...initialValues, fullName: '', phone: '' } as IUser);
    await userEvent.click(screen.getByRole('button', { name: 'Обновить' }));

    expect(await screen.findByText('Введите имя')).toBeInTheDocument();
    expect(screen.getByText('Введите номер телефона')).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
  });

  it('проверяет формат телефона', async () => {
    setup();
    await userEvent.clear(screen.getByLabelText('Телефон'));
    await userEvent.type(screen.getByLabelText('Телефон'), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Обновить' }));

    expect(
      await screen.findByText('Некорректный номер телефона'),
    ).toBeInTheDocument();
  });

  it('отправляет обновление с id', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Обновить' }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        id: 'm1',
        data: expect.objectContaining({ fullName: 'Иван Петров' }),
      }),
    );
  });

  it('передаёт изменённый статус', async () => {
    setup();
    await userEvent.click(screen.getByLabelText('Бан'));
    await userEvent.click(screen.getByRole('button', { name: 'Обновить' }));

    await waitFor(() =>
      expect(update.mock.calls[0][0].data.status).toBe('banned'),
    );
  });

  it('блокирует форму при isPending', () => {
    setup(true);
    expect(screen.getByLabelText('Телефон')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'обновление...' }),
    ).toBeDisabled();
  });
});
