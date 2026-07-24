import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderDetail from '../OrderDetail';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/authHooks';
import {
  useOneOrder,
  useDeleteOrder,
  useUpdateOrder,
} from '@/lib/hooks/orderHooks';
import { useModalStore } from '@/lib/stores/modalStore';
import { toast } from 'sonner';

vi.mock('next/navigation', () => ({ useParams: vi.fn(), useRouter: vi.fn() }));
vi.mock('@/lib/hooks/authHooks', () => ({ useUser: vi.fn() }));
vi.mock('@/lib/hooks/orderHooks', () => ({
  useOneOrder: vi.fn(),
  useDeleteOrder: vi.fn(),
  useUpdateOrder: vi.fn(),
}));
vi.mock('@/lib/stores/modalStore', () => ({ useModalStore: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/components/dashboard/orders/OrderManageForm', () => ({
  default: () => <div data-testid="manage-form" />,
}));
vi.mock('../StandardOrderAside', () => ({
  default: () => <div data-testid="standard-aside" />,
}));
vi.mock('../CustomOrderAside', () => ({
  default: () => <div data-testid="custom-aside" />,
}));
vi.mock('@/components/shared/Modal', () => ({
  Modal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/dashboard/orders/ContractForm', () => ({
  default: () => <div data-testid="contract-form" />,
}));
vi.mock('@/components/dashboard/orders/PaymentForm', () => ({
  default: () => <div data-testid="payment-form" />,
}));
vi.mock('@/components/dashboard/orders/DelegateOrder', () => ({
  DelegateOrder: () => <div data-testid="delegate-order" />,
}));

const deleteData = vi.fn();
const updateOrder = vi.fn();
const openModal = vi.fn();
const back = vi.fn();
const refetch = vi.fn();

const standardOrder = {
  _id: 'o1',
  type: 'STANDARD',
  visibleId: 'ORDER-2026-039',
  clientName: 'Людмила Андреева',
  clientPhone: '+79991112233',
  status: 'IN_PROGRESS',
  createdAt: '2026-07-08T12:00:00Z',
  managerId: { _id: 'm1', fullName: 'admin' },
  tourSetId: {
    _id: 'set-1',
    tourId: {
      title: 'Уикенд в Стамбуле',
      category: { title: 'Экскурсионные' },
    },
  },
};

const customOrder = {
  ...standardOrder,
  _id: 'o2',
  type: 'CUSTOM',
  tourSetId: undefined,
  customTour: { _id: 'ct1', countryCode: 'AZ' },
};

const setup = ({
  order = standardOrder as never,
  user = { _id: 'm1', role: 'ADMIN' } as never,
  isLoading = false,
  error = null as unknown,
} = {}) => {
  vi.mocked(useParams).mockReturnValue({ id: 'o1' } as never);
  vi.mocked(useRouter).mockReturnValue({ back, push: vi.fn() } as never);
  vi.mocked(useUser).mockReturnValue({ data: user } as never);
  vi.mocked(useOneOrder).mockReturnValue({
    data: order,
    isLoading,
    error,
    refetch,
  } as never);
  vi.mocked(useDeleteOrder).mockReturnValue({
    mutate: deleteData,
    isPending: false,
  } as never);
  vi.mocked(useUpdateOrder).mockReturnValue({
    mutate: updateOrder,
    isPending: false,
  } as never);
  vi.mocked(useModalStore).mockReturnValue({ openModal } as never);

  return render(<OrderDetail />);
};

describe('OrderDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает состояние загрузки', () => {
    setup({ isLoading: true });
    expect(screen.getByText('Загрузка заявки...')).toBeInTheDocument();
  });

  it('показывает ошибку с кнопкой повтора', async () => {
    setup({ error: new Error('fail'), order: null as never });
    expect(screen.getByText('Не удалось загрузить заявку')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Повторить попытку' }),
    );
    expect(refetch).toHaveBeenCalled();
  });

  describe('стандартная заявка', () => {
    it('показывает категорию и название тура', () => {
      setup();
      expect(screen.getByText('Экскурсионные')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Уикенд в Стамбуле' }),
      ).toBeInTheDocument();
    });

    it('рендерит StandardOrderAside', () => {
      setup();
      expect(screen.getByTestId('standard-aside')).toBeInTheDocument();
      expect(screen.queryByTestId('custom-aside')).not.toBeInTheDocument();
    });
  });

  describe('индивидуальная заявка', () => {
    it('показывает метку индивидуального тура', () => {
      setup({ order: customOrder as never });
      expect(screen.getByText('Индивидуальный тур')).toBeInTheDocument();
    });

    it('рендерит CustomOrderAside', () => {
      setup({ order: customOrder as never });
      expect(screen.getByTestId('custom-aside')).toBeInTheDocument();
      expect(screen.queryByTestId('standard-aside')).not.toBeInTheDocument();
    });
  });

  it('показывает контакт клиента', () => {
    setup();

    const clientNames = screen.getAllByText('Людмила Андреева');
    expect(clientNames.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+79991112233')).toBeInTheDocument();
  });

  it('показывает менеджера и дату создания', () => {
    setup();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText(/Создана 8 июля 2026/)).toBeInTheDocument();
  });

  it('копирует id заявки', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    setup();

    await userEvent.click(screen.getByTitle('скопировать ID'));
    expect(writeText).toHaveBeenCalledWith('o1');
  });

  describe('блок оплаты', () => {
    it('не показывается без данных оплаты', () => {
      setup();
      expect(
        screen.queryByText('Информация об оплате'),
      ).not.toBeInTheDocument();
    });

    it('показывается с данными оплаты', () => {
      setup({
        order: {
          ...standardOrder,
          paymentMethod: 'CASH',
          paymentAmount: 50000,
        } as never,
      });
      expect(screen.getByText('Информация об оплате')).toBeInTheDocument();
      expect(screen.getByText('Наличные')).toBeInTheDocument();
    });
  });

  describe('права доступа', () => {
    it('админ видит удаление и переназначение', () => {
      setup({ user: { _id: 'x', role: 'ADMIN' } as never });
      expect(
        screen.getByRole('button', { name: /Удалить/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Переназначить заявку/ }),
      ).toBeInTheDocument();
    });

    it('менеджер не видит удаление и переназначение', () => {
      setup({ user: { _id: 'm1', role: 'MANAGER' } as never });
      expect(
        screen.queryByRole('button', { name: /Удалить/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Переназначить заявку/ }),
      ).not.toBeInTheDocument();
    });

    it('владелец заявки видит "Отказаться"', () => {
      setup({ user: { _id: 'm1', role: 'MANAGER' } as never });
      expect(
        screen.getByRole('button', { name: /Отказаться/ }),
      ).toBeInTheDocument();
    });

    it('админ по чужой заявке видит "Отозвать"', () => {
      setup({ user: { _id: 'other', role: 'ADMIN' } as never });
      expect(
        screen.getByRole('button', { name: /Отозвать/ }),
      ).toBeInTheDocument();
    });

    it('кнопка отказа скрыта для завершённой заявки', () => {
      setup({ order: { ...standardOrder, status: 'COMPLETED' } as never });
      expect(
        screen.queryByRole('button', { name: /Отказаться/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('контракт', () => {
    it('заблокирован вне статуса CONTRACT_PENDING', () => {
      setup();
      expect(screen.getByRole('button', { name: /Контракт/ })).toBeDisabled();
    });

    it('доступен в статусе CONTRACT_PENDING', async () => {
      setup({
        order: { ...standardOrder, status: 'CONTRACT_PENDING' } as never,
      });
      const btn = screen.getByRole('button', { name: /Контракт/ });
      expect(btn).not.toBeDisabled();

      await userEvent.click(btn);
      expect(openModal).toHaveBeenCalledWith('contractModal');
    });
  });

  describe('фиксация оплаты', () => {
    it('не показывается в статусе IN_PROGRESS', () => {
      setup();
      expect(
        screen.queryByRole('button', { name: /Фиксация оплаты/ }),
      ).not.toBeInTheDocument();
    });

    it('показывается в статусе COMPLETED', () => {
      setup({ order: { ...standardOrder, status: 'COMPLETED' } as never });
      expect(
        screen.getByRole('button', { name: /Фиксация оплаты/ }),
      ).toBeInTheDocument();
    });
  });

  describe('удаление', () => {
    it('открывает диалог подтверждения', async () => {
      setup();
      await userEvent.click(screen.getByRole('button', { name: /Удалить/ }));

      expect(
        await screen.findByText('Вы уверены, что хотите удалить эту заявку?'),
      ).toBeInTheDocument();
      expect(deleteData).not.toHaveBeenCalled();
    });

    it('удаляет после подтверждения', async () => {
      setup();
      await userEvent.click(screen.getByRole('button', { name: /Удалить/ }));
      await screen.findByText('Вы уверены, что хотите удалить эту заявку?');

      const dialogButtons = screen.getAllByRole('button', { name: 'Удалить' });
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      await waitFor(() =>
        expect(deleteData).toHaveBeenCalledWith('o1', expect.anything()),
      );
    });

    it('возвращает назад после удаления', async () => {
      deleteData.mockImplementation((_id, opts) => opts.onSuccess());
      setup();
      await userEvent.click(screen.getByRole('button', { name: /Удалить/ }));
      await screen.findByText('Вы уверены, что хотите удалить эту заявку?');

      const dialogButtons = screen.getAllByRole('button', { name: 'Удалить' });
      await userEvent.click(dialogButtons[dialogButtons.length - 1]);

      await waitFor(() => expect(back).toHaveBeenCalled());
      expect(toast.success).toHaveBeenCalledWith('Заявка успешно удалена');
    });
  });

  describe('отказ от заявки', () => {
    it('сбрасывает менеджера и статус', async () => {
      setup({ user: { _id: 'm1', role: 'MANAGER' } as never });
      await userEvent.click(screen.getByRole('button', { name: /Отказаться/ }));
      await screen.findByText(/Вы уверены, что хотите отказаться/);
      await userEvent.click(
        screen.getByRole('button', { name: /^Отказаться$/ }),
      );

      await waitFor(() =>
        expect(updateOrder).toHaveBeenCalledWith(
          { id: 'o1', data: { status: 'NEW', managerId: null } },
          expect.anything(),
        ),
      );
    });
  });
});
