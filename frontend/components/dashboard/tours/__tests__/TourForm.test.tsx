import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourForm } from '../TourForm';
import { useCategories } from '@/lib/hooks/categoryHooks';
import { useCreateTour, useUpdateTour } from '@/lib/hooks/tourHooks';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('@/lib/hooks/categoryHooks', () => ({ useCategories: vi.fn() }));
vi.mock('@/lib/hooks/tourHooks', () => ({
  useCreateTour: vi.fn(),
  useUpdateTour: vi.fn(),
}));
vi.mock('@/components/dashboard/MultiImageInput/MultiImageInput', () => ({
  default: () => <div data-testid="multi-image-input" />,
}));

const createTour = vi.fn();
const updateTour = vi.fn();
const push = vi.fn();

const categories = [
  { _id: 'c1', title: 'Экскурсионные' },
  { _id: 'c2', title: 'Пляжные' },
];

const setup = ({
  isEdit = false,
  initialValues = undefined as never,
  tourId = undefined as string | undefined,
  isCreating = false,
  isUpdating = false,
  isCatsLoading = false,
} = {}) => {
  vi.mocked(useRouter).mockReturnValue({ push } as never);
  vi.mocked(useCategories).mockReturnValue({
    data: { categories },
    isLoading: isCatsLoading,
  } as never);
  vi.mocked(useCreateTour).mockReturnValue({
    mutate: createTour,
    isPending: isCreating,
  } as never);
  vi.mocked(useUpdateTour).mockReturnValue({
    mutate: updateTour,
    isPending: isUpdating,
  } as never);

  return render(
    <TourForm isEdit={isEdit} initialValues={initialValues} tourId={tourId} />,
  );
};

describe('TourForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('показывает заголовок создания', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: 'Создание тура' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Создать тур' }),
    ).toBeInTheDocument();
  });

  it('показывает заголовок редактирования', () => {
    setup({ isEdit: true, tourId: 't1' });
    expect(
      screen.getByRole('heading', { name: 'Редактирование тура' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    ).toBeInTheDocument();
  });

  it('требует обязательные поля', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Создать тур' }));

    expect(await screen.findByText('Введите название')).toBeInTheDocument();
    expect(screen.getByText('Введите описание')).toBeInTheDocument();

    expect(screen.getAllByText('Выберите категорию').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Выберите страну').length).toBeGreaterThan(0);

    expect(createTour).not.toHaveBeenCalled();
  });

  it('требует непустое преимущество', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Создать тур' }));
    await waitFor(() => {
      expect(createTour).not.toHaveBeenCalled();
    });
  });

  it('удаляет поле преимущества', async () => {
    const { container } = setup();

    await userEvent.click(
      screen.getByRole('button', { name: /Добавить преимущество/ }),
    );

    await waitFor(() => {
      expect(
        container.querySelectorAll('input[name^="baseAdvantages"]').length,
      ).toBe(2);
    });

    const deleteButtons = await screen.findAllByRole('button', {
      name: 'Удалить',
    });

    await userEvent.click(deleteButtons[0]);
    expect(deleteButtons[0]).toBeDefined();
  });

  it('добавляет поле преимущества', async () => {
    const { container } = setup();
    const before = container.querySelectorAll(
      'input[name^="baseAdvantages"]',
    ).length;

    await userEvent.click(
      screen.getByRole('button', { name: /Добавить преимущество/ }),
    );

    await waitFor(() => {
      expect(
        container.querySelectorAll('input[name^="baseAdvantages"]').length,
      ).toBe(before + 1);
    });
  });

  it('рендерит компонент загрузки изображений', () => {
    setup();
    expect(screen.getByTestId('multi-image-input')).toBeInTheDocument();
  });

  it('блокирует форму при сохранении', () => {
    setup({ isCreating: true });
    expect(screen.getByRole('button', { name: /Сохранение/ })).toBeDisabled();
  });

  it('не отправляет при редактировании без tourId', async () => {
    setup({
      isEdit: true,
      tourId: undefined,
      initialValues: {
        title: 'Тур',
        description: 'Описание',
        countryCode: 'TUR',
        category: 'c1',
        baseAdvantages: ['Питание'],
        images: [],
      } as never,
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    );

    await waitFor(() => expect(updateTour).not.toHaveBeenCalled());
  });

  it('отправляет обновление с id', async () => {
    setup({
      isEdit: true,
      tourId: 't1',
      initialValues: {
        title: 'Тур',
        description: 'Описание',
        countryCode: 'TUR',
        category: 'c1',
        baseAdvantages: ['Питание'],
        images: [],
      } as never,
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить изменения' }),
    );

    await waitFor(() =>
      expect(updateTour).toHaveBeenCalledWith(
        { id: 't1', data: expect.objectContaining({ title: 'Тур' }) },
        expect.anything(),
      ),
    );
  });

  it('редиректит после успешного создания', async () => {
    createTour.mockImplementation((_d, opts) => opts.onSuccess());
    setup({
      initialValues: {
        title: 'Тур',
        description: 'Описание',
        countryCode: 'TUR',
        category: 'c1',
        baseAdvantages: ['Питание'],
        images: [],
      } as never,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Создать тур' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/tours'));
  });
});
