import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomTourForm from '../CustomTourForm';
import { useCreateOrder } from '@/lib/hooks/orderHooks';
import { CUSTOM_TOUR_ACTIVITIES } from '@/lib/customTour/constants';
import { toast } from 'sonner';

vi.setConfig({ testTimeout: 15_000 });

vi.mock('@/lib/hooks/orderHooks', () => ({ useCreateOrder: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/countries', () => ({
  default: {
    getNames: () => ({
      KG: 'Кыргызстан',
      TR: 'Турция',
      GE: 'Грузия',
    }),
  },
}));

const postOrder = vi.fn();

const setup = (isPending = false) => {
  vi.mocked(useCreateOrder).mockReturnValue({
    mutate: postOrder,
    isPending,
  } as never);
  const user = userEvent.setup({ delay: null });
  return { user, ...render(<CustomTourForm />) };
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

  it('не отправляет заявку при пустых обязательных полях', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /Отправить заявку/ }));
    await waitFor(() => expect(postOrder).not.toHaveBeenCalled());
  });

  it('рендерит все варианты активностей', () => {
    setup();
    CUSTOM_TOUR_ACTIVITIES.forEach((activity) => {
      expect(screen.getByText(activity.label)).toBeInTheDocument();
    });
  });

  it('переключает активность по клику (вкл/выкл)', async () => {
    const { user } = setup();
    const first = CUSTOM_TOUR_ACTIVITIES[0];
    const button = screen.getByText(first.label).closest('button')!;

    await user.click(button);
    expect(button.className).toContain('border-cyan-700');

    await user.click(button);
    expect(button.className).not.toContain('bg-cyan-50');
  });

  it('открывает селект направления и выбирает страну', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Кыргызстан'));

    expect(screen.getByRole('combobox')).toHaveTextContent('Кыргызстан');
  });

  it('показывает подпись о сроке ответа', () => {
    setup();
    expect(
      screen.getByText('Менеджер свяжется с вами в течение часа'),
    ).toBeInTheDocument();
  });

  it('блокирует кнопку при отправке (isPending)', () => {
    setup(true);
    expect(
      screen.getByRole('button', { name: /Отправить заявку/ }),
    ).toBeDisabled();
  });

  it('контролируемые поля принимают ввод', async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText('Ваше имя'), 'Айгуль');
    await user.type(screen.getByLabelText('Телефон'), '+996700000000');
    await user.type(screen.getByLabelText('Отель'), 'Grand Hotel');

    expect(screen.getByLabelText('Ваше имя')).toHaveValue('Айгуль');
    expect(screen.getByLabelText('Телефон')).toHaveValue('+996700000000');
    expect(screen.getByLabelText('Отель')).toHaveValue('Grand Hotel');
  });

  it('показывает тост об ошибке, если мутация ответила onError', async () => {
    postOrder.mockImplementation((_data, opts) => opts?.onError?.());
    setup();
    postOrder(
      {},
      {
        onError: () =>
          toast.error('Ошибка сервера, попробуйте позже', {
            position: 'top-center',
          }),
      },
    );
    expect(toast.error).toHaveBeenCalledWith(
      'Ошибка сервера, попробуйте позже',
      { position: 'top-center' },
    );
  });
});
