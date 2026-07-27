import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourSetForm } from '../TourSetForm';
import { useCreateTourSet, useUpdateTourSet } from '@/lib/hooks/tourSets';
import { useRouter, usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));
vi.mock('@/lib/hooks/tourSets', () => ({
  useCreateTourSet: vi.fn(),
  useUpdateTourSet: vi.fn(),
}));

const createTourSet = vi.fn();
const updateTourSet = vi.fn();
const push = vi.fn();

const filled = {
  tourId: 'tour-1',
  startDate: '2026-09-10T00:00:00.000Z',
  endDate: '2026-09-13T00:00:00.000Z',
  price: 45000,
  hotelName: 'Legacy Ottoman',
  hotelLocation: 'Стамбул',
  airline: '',
  flightDetails: '',
  totalSeats: 20,
  isHot: false,
  saleDeadline: '',
  status: 'OPEN' as const,
};

const setup = ({
  isEdit = false,
  initialValues = undefined as never,
  tourSetId = undefined as string | undefined,
  isCreating = false,
  isUpdating = false,
  pathname = '/admin/tours',
} = {}) => {
  vi.mocked(useRouter).mockReturnValue({ push } as never);
  vi.mocked(usePathname).mockReturnValue(pathname);
  vi.mocked(useCreateTourSet).mockReturnValue({
    mutate: createTourSet,
    isPending: isCreating,
  } as never);
  vi.mocked(useUpdateTourSet).mockReturnValue({
    mutate: updateTourSet,
    isPending: isUpdating,
  } as never);

  return render(
    <TourSetForm
      isEdit={isEdit}
      initialValues={initialValues}
      tourSetId={tourSetId}
      parentTourId="tour-1"
    />,
  );
};

describe('TourSetForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает заголовок создания', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: 'Добавление потока' }),
    ).toBeInTheDocument();
  });

  it('показывает заголовок редактирования', () => {
    setup({ isEdit: true, tourSetId: 's1', initialValues: filled as never });
    expect(
      screen.getByRole('heading', { name: 'Редактирование потока' }),
    ).toBeInTheDocument();
  });

  it('требует даты, отель и локацию', async () => {
    setup();
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать поток' }),
    );

    expect(await screen.findByText('Укажите дату начала')).toBeInTheDocument();
    expect(screen.getByText('Укажите дату окончания')).toBeInTheDocument();
    expect(screen.getByText('Введите название отеля')).toBeInTheDocument();
    expect(screen.getByText('Укажите локацию отеля')).toBeInTheDocument();
    expect(createTourSet).not.toHaveBeenCalled();
  });

  it('отклоняет отрицательную цену', async () => {
    setup({ initialValues: { ...filled, price: -100 } as never });
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать поток' }),
    );

    expect(
      await screen.findByText('Цена не может быть отрицательной'),
    ).toBeInTheDocument();
  });

  it('требует скидочную цену меньше основной', async () => {
    setup({
      initialValues: { ...filled, price: 1000, discountPrice: 2000 } as never,
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать поток' }),
    );

    expect(
      await screen.findByText('Скидочная цена должна быть меньше основной'),
    ).toBeInTheDocument();
  });

  it('показывает статус только в режиме редактирования', () => {
    setup();
    expect(screen.queryByText('Статус потока')).not.toBeInTheDocument();
  });

  it('показывает статус при редактировании', () => {
    setup({ isEdit: true, tourSetId: 's1', initialValues: filled as never });
    expect(screen.getByText('Статус потока')).toBeInTheDocument();
  });

  it('дедлайн заблокирован без акции', () => {
    setup({ initialValues: filled as never });
    expect(screen.getByText('Сначала укажите акцию')).toBeInTheDocument();
  });

  it('дедлайн доступен при горящем потоке', () => {
    setup({ initialValues: { ...filled, isHot: true } as never });
    expect(screen.getByText('Выберите дедлайн')).toBeInTheDocument();
  });

  it('отправляет данные с приведёнными типами', async () => {
    setup({ initialValues: filled as never });
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать поток' }),
    );

    await waitFor(() => expect(createTourSet).toHaveBeenCalled());
    const [payload] = createTourSet.mock.calls[0];
    expect(payload.tourId).toBe('tour-1');
    expect(payload.price).toBe(45000);
    expect(payload.totalSeats).toBe(20);
    expect(payload.startDate).toBe('2026-09-10');
  });

  it('не отправляет обновление без tourSetId', async () => {
    setup({
      isEdit: true,
      tourSetId: undefined,
      initialValues: filled as never,
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения потока' }),
    );

    await waitFor(() => expect(updateTourSet).not.toHaveBeenCalled());
  });

  it('редиректит на страницу тура после создания', async () => {
    createTourSet.mockImplementation((_d, opts) => opts.onSuccess());
    setup({ initialValues: filled as never });
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать поток' }),
    );

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/admin/tours/tour-1'),
    );
  });

  it('использует путь менеджера при manager-роуте', async () => {
    createTourSet.mockImplementation((_d, opts) => opts.onSuccess());
    setup({ initialValues: filled as never, pathname: '/manager/tours' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Создать поток' }),
    );

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/manager/tours/tour-1'),
    );
  });
});
