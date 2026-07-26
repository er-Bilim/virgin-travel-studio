import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { useTourById } from '@/lib/hooks/tourHooks';
import { TourForm } from '@/components/dashboard/tours/TourForm';
import EditTour from "@/components/dashboard/tours/ToursDashboards/TourEdit";

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

vi.mock('@/lib/hooks/tourHooks', () => ({
  useTourById: vi.fn(),
}));

vi.mock('@/components/dashboard/tours/TourForm', () => ({
  TourForm: vi.fn(() => <div data-testid="tour-form" />),
}));

const mockTourObjCategory = {
  _id: 'tour-123',
  title: 'Тестовый тур',
  description: 'Описание тура',
  countryCode: 'KG',
  category: { _id: 'cat-1', title: 'Горы' },
  baseAdvantages: ['Преимущество 1'],
  images: ['image1.jpg'],
};

const setup = ({
                 id = 'tour-123',
                 isLoading = false,
                 isError = false,
                 tourData = mockTourObjCategory as never,
               } = {}) => {
  vi.mocked(useParams).mockReturnValue({ id });
  vi.mocked(useTourById).mockReturnValue({
    data: tourData,
    isLoading,
    isError,
  } as never);

  return render(<EditTour />);
};

describe('EditTour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает состояние загрузки', () => {
    setup({ isLoading: true });

    expect(screen.getByText('Загрузка данных тура...')).toBeInTheDocument();
    expect(screen.queryByTestId('tour-form')).not.toBeInTheDocument();
  });

  it('отображает ошибку, если тур не найден или произошла ошибка', () => {
    setup({ isError: true });

    expect(screen.getByText('Тур не найден')).toBeInTheDocument();
    expect(
      screen.getByText('Возможно, он был удален или ссылка неверна.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('tour-form')).not.toBeInTheDocument();
  });

  it('отображает ошибку, если тур равен null', () => {
    setup({ tourData: null as never });

    expect(screen.getByText('Тур не найден')).toBeInTheDocument();
    expect(screen.queryByTestId('tour-form')).not.toBeInTheDocument();
  });

  it('успешно отображает заголовок и форму с правильными пропсами при объекте категории', () => {
    setup();

    expect(screen.getByText('Редактирование')).toBeInTheDocument();
    expect(screen.getByText('ID тура: tour-123')).toBeInTheDocument();
    expect(screen.getByTestId('tour-form')).toBeInTheDocument();

    expect(TourForm).toHaveBeenCalledWith(
      {
        isEdit: true,
        tourId: 'tour-123',
        initialValues: {
          title: 'Тестовый тур',
          description: 'Описание тура',
          countryCode: 'KG',
          category: 'cat-1',
          baseAdvantages: ['Преимущество 1'],
          images: ['image1.jpg'],
        },
      },
      undefined
    );
  });

  it('корректно обрабатывает категорию, если она передана строкой', () => {
    const mockTourStringCategory = {
      ...mockTourObjCategory,
      category: 'cat-string-id',
    };

    setup({ tourData: mockTourStringCategory as never });

    expect(TourForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: expect.objectContaining({
          category: 'cat-string-id',
        }),
      }),
      undefined
    );
  });

  it('корректно обрабатывает категорию, если она не указана', () => {
    const mockTourNoCategory = {
      ...mockTourObjCategory,
      category: null,
    };

    setup({ tourData: mockTourNoCategory as never });

    expect(TourForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: expect.objectContaining({
          category: '',
        }),
      }),
      undefined
    );
  });
});