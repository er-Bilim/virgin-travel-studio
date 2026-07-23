import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderManageForm from '../OrderManageForm';
import { useUpdateOrder } from '@/lib/hooks/orderHooks';
import { toast } from 'sonner';
import type { OrderMutationType } from '@/types/order';

vi.mock('@/lib/hooks/orderHooks', () => ({ useUpdateOrder: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const updateOrder = vi.fn();

const initialValues = {
  clientName: 'Людмила Андреева',
  clientPhone: '+79991112233',
  status: 'IN_PROGRESS',
  rejectionReason: '',
} as unknown as OrderMutationType;

const setup = (
  opts: {
    isUpdating?: boolean;
    orderId?: string;
    values?: OrderMutationType;
  } = {},
) => {
  const isUpdating = opts.isUpdating ?? false;
  const values = opts.values ?? initialValues;
  const orderId = 'orderId' in opts ? opts.orderId : 'o1';

  vi.mocked(useUpdateOrder).mockReturnValue({
    mutate: updateOrder,
    isPending: isUpdating,
  } as never);

  return render(<OrderManageForm initialValues={values} orderId={orderId} />);
};

describe('OrderManageForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('подставляет начальные значения', () => {
    setup();
    expect(screen.getByDisplayValue('Людмила Андреева')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+79991112233')).toBeInTheDocument();
  });

  it('показывает индикатор при обновлении', () => {
    setup({ isUpdating: true });
    expect(screen.getByText('Обновляется...')).toBeInTheDocument();
  });

  it('требует имя и телефон', async () => {
    setup({ values: { ...initialValues, clientName: '', clientPhone: '' } });
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    );

    expect(await screen.findByText('Введите имя клиента')).toBeInTheDocument();
    expect(screen.getByText('Введите телефон клиента')).toBeInTheDocument();
    expect(updateOrder).not.toHaveBeenCalled();
  });

  it('показывает ошибку без orderId', async () => {
    setup({ orderId: undefined });
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Ошибка: Нет ID заявки'),
    );
    expect(updateOrder).not.toHaveBeenCalled();
  });

  it('отправляет данные заявки', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    );

    await waitFor(() => expect(updateOrder).toHaveBeenCalled());
    const [payload] = updateOrder.mock.calls[0];
    expect(payload.id).toBe('o1');
    expect(payload.data.clientName).toBe('Людмила Андреева');
  });

  it('очищает причину отказа для не-REJECTED статуса', async () => {
    setup({ values: { ...initialValues, rejectionReason: 'старая причина' } });
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    );

    await waitFor(() => expect(updateOrder).toHaveBeenCalled());
    expect(updateOrder.mock.calls[0][0].data.rejectionReason).toBe('');
  });

  it('показывает тост об успехе', async () => {
    updateOrder.mockImplementation((_p, opts) => opts.onSuccess());
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    );

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Заявка обновлена',
        expect.anything(),
      ),
    );
  });

  it('показывает тост об ошибке сервера', async () => {
    updateOrder.mockImplementation((_p, opts) => opts.onError());
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Ошибка при обновлении на сервере',
      ),
    );
  });

  it('открывает модалку отказа', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Отклонить заявку/ }),
    );

    expect(
      await screen.findByText('Укажите причину отмены заявки'),
    ).toBeInTheDocument();
  });

  it('требует причину при подтверждении отказа', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Отклонить заявку/ }),
    );
    await screen.findByText('Укажите причину отмены заявки');
    await userEvent.click(
      screen.getByRole('button', { name: 'Подтвердить отмену' }),
    );

    expect(
      await screen.findByText('Укажите причину отказа'),
    ).toBeInTheDocument();
  });

  it('закрывает модалку при валидной причине', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Отклонить заявку/ }),
    );
    await userEvent.type(
      await screen.findByPlaceholderText(/Клиент передумал/),
      'Нет мест',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Подтвердить отмену' }),
    );

    await waitFor(() =>
      expect(
        screen.queryByText('Укажите причину отмены заявки'),
      ).not.toBeInTheDocument(),
    );
  });

  it('сбрасывает статус по кнопке "Назад"', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Отклонить заявку/ }),
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Назад' }));

    await waitFor(() =>
      expect(
        screen.queryByText('Укажите причину отмены заявки'),
      ).not.toBeInTheDocument(),
    );
  });
});
