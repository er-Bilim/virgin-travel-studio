import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import {
  useTourById,
  useDeleteTour,
  useTogglePublish,
} from '@/lib/hooks/tourHooks';
import { useUser } from '@/lib/hooks/authHooks';
import { toast } from 'sonner';
import TourDetails
  from "@/components/dashboard/tours/ToursDashboards/TourDetail";

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock('@/lib/hooks/tourHooks', () => ({
  useTourById: vi.fn(),
  useDeleteTour: vi.fn(),
  useTogglePublish: vi.fn(),
}));

vi.mock('@/lib/hooks/authHooks', () => ({
  useUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

vi.mock(
  '@/components/dashboard/tourSets/TourSetsDashboards/TourSetsTable',
  () => ({
    default: () => <div data-testid="tour-sets-table" />,
  }),
);

vi.mock('@/components/dashboard/tourSets/TourSetReviewsManager', () => ({
  default: () => <div data-testid="tour-set-reviews-manager" />,
}));

const pushMock = vi.fn();
const backMock = vi.fn();
const deleteTourMock = vi.fn();
const togglePublishMock = vi.fn();

const mockTour = {
  _id: 'tour-123',
  title: 'Тестовый тур',
  description: 'Описание тестового тура',
  countryCode: 'KG',
  isPublished: true,
  category: { _id: 'cat-1', title: 'Горы' },
  baseAdvantages: ['Вид на озеро', 'Трансфер'],
  images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg'],
};

const setup = ({
                 isLoading = false,
                 tourData = mockTour as never,
                 userRole = 'ADMIN',
                 isDeleting = false,
                 isPublishing = false,
               } = {}) => {
  vi.mocked(useParams).mockReturnValue({ id: 'tour-123' });
  vi.mocked(useRouter).mockReturnValue({
    push: pushMock,
    back: backMock,
  } as never);
  vi.mocked(useUser).mockReturnValue({
    data: { role: userRole },
  } as never);
  vi.mocked(useTourById).mockReturnValue({
    data: tourData,
    isLoading,
  } as never);
  vi.mocked(useDeleteTour).mockReturnValue({
    mutate: deleteTourMock,
    isPending: isDeleting,
  } as never);
  vi.mocked(useTogglePublish).mockReturnValue({
    mutate: togglePublishMock,
    isPending: isPublishing,
  } as never);

  return render(<TourDetails />);
};

describe('TourDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает состояние загрузки', () => {
    setup({ isLoading: true });
    expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
  });

  it('отображает состояние, когда тур не найден', () => {
    setup({ tourData: null as never });
    expect(screen.getByText('Тур не найден')).toBeInTheDocument();
  });

  it('успешно рендерит детали тура', () => {
    setup();

    expect(screen.getByText('Тестовый тур')).toBeInTheDocument();
    expect(screen.getByText('UUID: tour-123')).toBeInTheDocument();
    expect(screen.getByText('Горы')).toBeInTheDocument();
    expect(screen.getByText('Описание тестового тура')).toBeInTheDocument();
    expect(screen.getByText('Вид на озеро')).toBeInTheDocument();
    expect(screen.getByText('Трансфер')).toBeInTheDocument();
    expect(screen.getByText('+ еще 1 фото')).toBeInTheDocument();
    expect(screen.getByTestId('tour-sets-table')).toBeInTheDocument();
    expect(screen.getByTestId('tour-set-reviews-manager')).toBeInTheDocument();
  });

  it('показывает плашку Черновик для неопубликованного тура', () => {
    setup({
      tourData: { ...mockTour, isPublished: false } as never,
    });

    expect(screen.getByText('Черновик')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Опубликовать' }),
    ).toBeInTheDocument();
  });

  it('возвращается назад при клике на кнопку Назад к списку', async () => {
    setup();

    await userEvent.click(
      screen.getByRole('button', { name: /Назад к списку/i }),
    );

    expect(backMock).toHaveBeenCalledTimes(1);
  });

  it('вызывает togglePublish при клике на публикацию', async () => {
    setup();

    const publishButton = screen.getByRole('button', {
      name: 'Снять с публикации',
    });
    await userEvent.click(publishButton);

    expect(togglePublishMock).toHaveBeenCalledWith({
      id: 'tour-123',
      isPublished: false,
    });
  });

  it('скрывает кнопку удаления для не-АДМИНА', () => {
    setup({ userRole: 'USER' });

    expect(
      screen.queryByRole('button', { name: '' }),
    ).not.toBeInTheDocument();
  });

  it('открывает диалог удаления и выполняет успешное удаление', async () => {
    deleteTourMock.mockImplementation((_id, opts) => opts.onSuccess());
    setup();

    const deleteIconButtons = screen.getAllByRole('button');
    const deleteBtn = deleteIconButtons[deleteIconButtons.length - 1];

    await userEvent.click(deleteBtn);

    expect(
      screen.getByText('Вы уверены, что хотите удалить этот тур?'),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Удалить' });
    await userEvent.click(confirmBtn);

    expect(deleteTourMock).toHaveBeenCalledWith('tour-123', expect.anything());
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/admin/tours');
    });
  });

  it('показывает ошибку через toast при неудачном удалении', async () => {
    const errorResponse = {
      response: { data: { error: 'Ошибка сервера при удалении' } },
    };
    deleteTourMock.mockImplementation((_id, opts) =>
      opts.onError(errorResponse),
    );

    setup();

    const deleteIconButtons = screen.getAllByRole('button');
    const deleteBtn = deleteIconButtons[deleteIconButtons.length - 1];

    await userEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Удалить' });
    await userEvent.click(confirmBtn);

    expect(deleteTourMock).toHaveBeenCalledWith('tour-123', expect.anything());
    expect(toast.error).toHaveBeenCalledWith(
      'Ошибка сервера при удалении',
      { duration: 5000 },
    );
  });
});