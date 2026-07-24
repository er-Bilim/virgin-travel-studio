import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomTourForm from '../CustomTourForm';
import { useCreateOrder } from '@/lib/hooks/orderHooks';
import { CUSTOM_TOUR_ACTIVITIES } from '@/lib/customTour/constants';
import { toast } from 'sonner';

vi.mock('@/lib/hooks/orderHooks', () => ({ useCreateOrder: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const postOrder = vi.fn();

const setup = (isPending = false) => {
  vi.mocked(useCreateOrder).mockReturnValue({
    mutate: postOrder,
    isPending,
  } as never);
  return render(<CustomTourForm />);
};

describe('CustomTourForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('рендерит основные секции формы', () => {
    setup();
    expect(screen.getByText('Куда и когда')).toBeInTheDocument();
    expect(screen.getByText('Как с вами связаться')).toBeInTheDocument();
    expect(screen.getByLabelText('Ваше имя')).toBeInTheDocument();
    expect(screen.getByLabelText('Телефон')).toBeInTheDocument();
  });

  it('требует обязательные поля', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    );

    await waitFor(() => expect(postOrder).not.toHaveBeenCalled());
  });

  it('рендерит все варианты активностей', () => {
    setup();
    CUSTOM_TOUR_ACTIVITIES.forEach((activity) => {
      expect(screen.getByText(activity.label)).toBeInTheDocument();
    });
  });

  it('переключает активность', async () => {
    setup();
    const first = CUSTOM_TOUR_ACTIVITIES[0];
    const button = screen.getByText(first.label).closest('button')!;

    await userEvent.click(button);
    expect(button.className).toContain('border-cyan-700');

    await userEvent.click(button);
    expect(button.className).not.toContain('bg-cyan-50');
  });

  it('показывает подпись о сроке ответа', () => {
    setup();
    expect(
      screen.getByText('Менеджер свяжется с вами в течение часа'),
    ).toBeInTheDocument();
  });

  it('блокирует кнопку при отправке', () => {
    setup(true);
    expect(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    ).toBeDisabled();
  });

  it('заполняет и отправляет заявку', async () => {
    setup();
    await userEvent.type(screen.getByLabelText('Ваше имя'), 'Straw');
    await userEvent.type(screen.getByLabelText('Телефон'), '+996700000000');
    await userEvent.type(screen.getByLabelText('Отель'), 'Hotel');

    expect(screen.getByLabelText('Ваше имя')).toHaveValue('Straw');
    expect(screen.getByLabelText('Отель')).toHaveValue('Hotel');
  });

  it('показывает тост об успехе', async () => {
    postOrder.mockImplementation((_d, opts) => opts.onSuccess());
    setup();

    expect(toast.success).not.toHaveBeenCalled();
  });
});
