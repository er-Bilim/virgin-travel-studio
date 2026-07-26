import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { useOneTourSet } from '@/lib/hooks/tourSets';
import { TourSetForm } from '@/components/dashboard/tourSets/TourSetForm';
import EditTourSet
  from "@/components/dashboard/tourSets/TourSetsDashboards/TourSetEdit";

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

vi.mock('@/lib/hooks/tourSets', () => ({
  useOneTourSet: vi.fn(),
}));

vi.mock('@/components/dashboard/tourSets/TourSetForm', () => ({
  TourSetForm: vi.fn(() => <div data-testid="tour-set-form" />),
}));

const mockTourSet = {
  _id: 'group-123',
  startDate: '2025-06-01',
  endDate: '2025-06-10',
  price: 1000,
  discountPrice: 800,
  hotelName: 'Grand Hotel',
  hotelLocation: 'Beach Area',
  airline: 'Air Astana',
  flightDetails: 'Flight 123',
  totalSeats: 20,
  isHot: true,
  status: 'OPEN',
  saleDeadline: '2025-05-25',
};

const setup = ({
                 groupID = 'group-123',
                 id = 'tour-456',
                 isLoading = false,
                 isError = false,
                 tourSetData = mockTourSet as never,
               } = {}) => {
  vi.mocked(useParams).mockReturnValue({ groupID, id });
  vi.mocked(useOneTourSet).mockReturnValue({
    data: tourSetData,
    isLoading,
    isError,
  } as never);

  return render(<EditTourSet />);
};

describe('EditTourSet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает состояние загрузки', () => {
    setup({ isLoading: true });

    expect(
      screen.getByText('Загрузка данных потока...'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('tour-set-form')).not.toBeInTheDocument();
  });

  it('отображает ошибку, если произошла ошибка загрузки', () => {
    setup({ isError: true });

    expect(screen.getByText('Поток не найден')).toBeInTheDocument();
    expect(
      screen.getByText('Возможно, он был удален или ссылка неверна.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('tour-set-form')).not.toBeInTheDocument();
  });

  it('отображает ошибку, если поток равен null', () => {
    setup({ tourSetData: null as never });

    expect(screen.getByText('Поток не найден')).toBeInTheDocument();
    expect(screen.queryByTestId('tour-set-form')).not.toBeInTheDocument();
  });

  it('успешно отображает данные и передает правильные пропсы в TourSetForm', () => {
    setup();

    expect(screen.getByText('Редактирование потока')).toBeInTheDocument();
    expect(screen.getByText('ID потока: group-123')).toBeInTheDocument();
    expect(screen.getByTestId('tour-set-form')).toBeInTheDocument();

    expect(TourSetForm).toHaveBeenCalledWith(
      {
        isEdit: true,
        parentTourId: 'tour-456',
        tourSetId: 'group-123',
        initialValues: {
          startDate: '2025-06-01',
          endDate: '2025-06-10',
          price: 1000,
          discountPrice: 800,
          hotelName: 'Grand Hotel',
          hotelLocation: 'Beach Area',
          airline: 'Air Astana',
          flightDetails: 'Flight 123',
          totalSeats: 20,
          isHot: true,
          status: 'OPEN',
          saleDeadline: '2025-05-25',
        },
      },
      undefined
    );
  });

  it('корректно подставляет значения по умолчанию для опциональных полей', () => {
    const mockEmptyTourSet = {
      _id: 'group-123',
      startDate: null,
      endDate: null,
      price: 500,
      discountPrice: null,
      hotelName: 'Hotel',
      hotelLocation: 'City',
      airline: null,
      flightDetails: null,
      totalSeats: 10,
      isHot: null,
      status: null,
      saleDeadline: null,
    };

    setup({ tourSetData: mockEmptyTourSet as never });

    expect(TourSetForm).toHaveBeenCalledWith(
      {
        isEdit: true,
        parentTourId: 'tour-456',
        tourSetId: 'group-123',
        initialValues: {
          startDate: undefined,
          endDate: undefined,
          price: 500,
          discountPrice: undefined,
          hotelName: 'Hotel',
          hotelLocation: 'City',
          airline: '',
          flightDetails: '',
          totalSeats: 10,
          isHot: false,
          status: 'OPEN',
          saleDeadline: undefined,
        },
      },
      undefined
    );
  });
});