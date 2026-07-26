import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentForm from '../PaymentForm';
import { useUpdateOrder } from '@/lib/hooks/orderHooks';
import { useUser } from '@/lib/hooks/authHooks';
import { useModalStore } from '@/lib/stores/modalStore';

vi.mock('@/lib/hooks/orderHooks', () => ({ useUpdateOrder: vi.fn() }));
vi.mock('@/lib/hooks/authHooks', () => ({ useUser: vi.fn() }));
vi.mock('@/lib/stores/modalStore', () => ({ useModalStore: vi.fn() }));

const updateOrder = vi.fn();
const closeModal = vi.fn();

const setup = (isPending = false) => {
  vi.mocked(useUpdateOrder).mockReturnValue({
    mutate: updateOrder,
    isPending,
  } as never);
  vi.mocked(useUser).mockReturnValue({ data: { _id: 'u1' } } as never);
  vi.mocked(useModalStore).mockReturnValue({ closeModal } as never);
  return render(<PaymentForm orderId="o1" />);
};

describe('PaymentForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('рендерит поля формы', () => {
    setup();
    expect(screen.getByText('Способ оплаты')).toBeInTheDocument();
    expect(screen.getByLabelText('Сумма оплаты')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Сохранить оплату/ }),
    ).toBeInTheDocument();
  });

  it('требует сумму больше нуля', async () => {
    setup();
    await userEvent.clear(screen.getByLabelText('Сумма оплаты'));
    await userEvent.type(screen.getByLabelText('Сумма оплаты'), '0');
    await userEvent.click(
      screen.getByRole('button', { name: /Сохранить оплату/ }),
    );

    expect(
      await screen.findByText('Сумма должна быть больше 0'),
    ).toBeInTheDocument();
    expect(updateOrder).not.toHaveBeenCalled();
  });

  it('отправляет данные оплаты', async () => {
    setup();
    await userEvent.clear(screen.getByLabelText('Сумма оплаты'));
    await userEvent.type(screen.getByLabelText('Сумма оплаты'), '50000');
    await userEvent.click(
      screen.getByRole('button', { name: /Сохранить оплату/ }),
    );

    await waitFor(() => {
      expect(updateOrder).toHaveBeenCalledWith(
        {
          id: 'o1',
          data: {
            managerId: 'u1',
            paymentMethod: 'CASH',
            paymentAmount: 50000,
          },
        },
        expect.anything(),
      );
    });
  });

  it('закрывает модалку после успеха', async () => {
    updateOrder.mockImplementation((_p, opts) => opts.onSuccess());
    setup();
    await userEvent.clear(screen.getByLabelText('Сумма оплаты'));
    await userEvent.type(screen.getByLabelText('Сумма оплаты'), '1000');
    await userEvent.click(
      screen.getByRole('button', { name: /Сохранить оплату/ }),
    );

    await waitFor(() => expect(closeModal).toHaveBeenCalledOnce());
  });

  it('блокирует форму при isPending', () => {
    setup(true);
    expect(screen.getByLabelText('Сумма оплаты')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
