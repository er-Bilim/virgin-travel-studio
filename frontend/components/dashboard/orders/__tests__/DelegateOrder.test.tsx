import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DelegateOrder } from '../DelegateOrder';
import { useManagers } from '@/lib/hooks/managerHook';
import { useDelegateOrder } from '@/lib/hooks/orderHooks';
import { useModalStore } from '@/lib/stores/modalStore';

vi.mock('@/lib/hooks/managerHook', () => ({ useManagers: vi.fn() }));
vi.mock('@/lib/hooks/orderHooks', () => ({ useDelegateOrder: vi.fn() }));
vi.mock('@/lib/stores/modalStore', () => ({ useModalStore: vi.fn() }));

const delegate = vi.fn();
const closeModal = vi.fn();

const managers = [
  { _id: 'm1', fullName: 'Иван Петров' },
  { _id: 'm2', fullName: 'Мария Иванова' },
];

const setup = ({
  data = managers,
  isLoading = false,
  isPending = false,
  currentManagerId = undefined as string | undefined,
} = {}) => {
  vi.mocked(useManagers).mockReturnValue({ data, isLoading } as never);
  vi.mocked(useDelegateOrder).mockReturnValue({
    mutate: delegate,
    isPending,
  } as never);
  vi.mocked(useModalStore).mockReturnValue({ closeModal } as never);
  return render(
    <DelegateOrder orderId="o1" currentManagerId={currentManagerId} />,
  );
};

describe('DelegateOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('рендерит селект и кнопку', () => {
    setup();
    expect(screen.getByText('Выберите менеджера')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Переназначить' }),
    ).toBeInTheDocument();
  });

  it('показывает сообщение, если менеджеров нет', () => {
    setup({ data: [] });
    expect(
      screen.getByText('Нет доступных активных менеджеров для переназначения.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('исключает текущего менеджера из списка', () => {
    setup({ currentManagerId: 'm1', data: [managers[0]] });
    expect(
      screen.getByText('Нет доступных активных менеджеров для переназначения.'),
    ).toBeInTheDocument();
  });

  it('кнопка заблокирована без выбора', () => {
    setup();
    expect(
      screen.getByRole('button', { name: 'Переназначить' }),
    ).toBeDisabled();
  });

  it('выбирает менеджера и переназначает', async () => {
    setup();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Иван Петров'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Переназначить' }),
    );

    await waitFor(() =>
      expect(delegate).toHaveBeenCalledWith(
        { id: 'o1', managerId: 'm1' },
        expect.anything(),
      ),
    );
  });

  it('закрывает модалку после успеха', async () => {
    delegate.mockImplementation((_p, opts) => opts.onSuccess());
    setup();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Мария Иванова'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Переназначить' }),
    );

    await waitFor(() => expect(closeModal).toHaveBeenCalledOnce());
  });

  it('показывает состояние отправки', () => {
    setup({ isPending: true });
    expect(
      screen.getByRole('button', { name: 'Переназначаем...' }),
    ).toBeDisabled();
  });

  it('блокирует селект при загрузке', () => {
    setup({ isLoading: true });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
