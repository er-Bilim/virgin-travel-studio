import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderCard from '../OrderCard';
import { useCreateOrder } from '@/lib/hooks/orderHooks';
import { toast } from 'sonner';

vi.mock('@/lib/hooks/orderHooks', () => ({ useCreateOrder: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const postOrder = vi.fn();

const defaults = {
  isOpen: true,
  tourSetId: 'set-1',
  tourTitle: 'Уикенд в Стамбуле',
  startDate: '2026-09-10T12:00:00Z',
  endDate: '2026-09-13T12:00:00Z',
  price: 45000,
};

const setup = (overrides = {}) => {
  vi.mocked(useCreateOrder).mockReturnValue({ mutate: postOrder } as never);
  const onClose = vi.fn();
  render(<OrderCard {...defaults} {...overrides} onClose={onClose} />);
  return { onClose };
};

const fill = async () => {
  await userEvent.type(screen.getByLabelText('Ваше имя'), 'Людмила');
  await userEvent.type(screen.getByLabelText('Телефон'), '+996700000000');
};

describe('OrderCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('не рендерится в закрытом состоянии', () => {
    setup({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('показывает название тура и даты', () => {
    setup();
    expect(screen.getByText('Уикенд в Стамбуле')).toBeInTheDocument();
    expect(screen.getByText(/10 сентября/)).toBeInTheDocument();
    expect(screen.getByText(/13 сентября/)).toBeInTheDocument();
  });

  it('показывает цену', () => {
    setup();
    expect(screen.getByText(/45/)).toBeInTheDocument();
  });

  it('требует имя и телефон', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    );

    expect((await screen.findAllByText('Поле обязательно')).length).toBe(2);
    expect(postOrder).not.toHaveBeenCalled();
  });

  it('отклоняет имя из одних пробелов', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Ваше имя'), '   ');
    await userEvent.type(screen.getByLabelText('Телефон'), '+996700000000');
    await userEvent.click(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    );

    expect(
      await screen.findByText('Поле не может состоять только из пробелов'),
    ).toBeInTheDocument();
  });

  it('отклоняет некорректный телефон', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Ваше имя'), 'Людмила');
    await userEvent.type(screen.getByLabelText('Телефон'), '123');
    await userEvent.click(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    );

    expect(
      await screen.findByText('Введите корректный номер телефона'),
    ).toBeInTheDocument();
  });

  it('отправляет заявку с tourSetId', async () => {
    setup();
    await fill();
    await userEvent.click(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    );

    await waitFor(() =>
      expect(postOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          tourSetId: 'set-1',
          clientName: 'Людмила',
          clientPhone: '+996700000000',
        }),
        expect.anything(),
      ),
    );
  });

  it('очищает разделители в телефоне', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Ваше имя'), 'Людмила');
    await userEvent.type(
      screen.getByLabelText('Телефон'),
      '+996 (700) 00-00-00',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    );

    await waitFor(() => expect(postOrder).toHaveBeenCalled());
    expect(postOrder.mock.calls[0][0].clientPhone).toBe('+996700000000');
  });

  it('закрывает модалку и показывает тост после успеха', async () => {
    postOrder.mockImplementation((_d, opts) => opts.onSuccess());
    const { onClose } = setup();
    await fill();
    await userEvent.click(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    );

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Заявка успешно отправлена'),
      expect.anything(),
    );
  });

  it('при ошибке сервера не показывает тост успеха и не закрывает модалку', async () => {
    postOrder.mockImplementation((_d, opts) => opts?.onError?.(new Error('500')));
    const { onClose } = setup();
    await fill();
    await userEvent.click(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    );

    await waitFor(() => expect(postOrder).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('закрывает модалку по кнопке "Закрыть"', async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
