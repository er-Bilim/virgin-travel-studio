import { render, screen, fireEvent } from '@testing-library/react';
import TourSetDetailsPage from '../TourSetDetailsPage';
import { useOneTourSet } from '@/lib/hooks/tourSets';
import { useRouter, useParams } from 'next/navigation';
import type { TourSetType } from '@/types/tourSets';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('@/lib/hooks/tourSets', () => ({
  useOneTourSet: vi.fn(),
}));

vi.mock('@/components/tourGallery/TourGallery', () => ({
  default: () => <div data-testid="mock-tour-gallery">Tour Gallery Component</div>,
}));

const mockTourSet: TourSetType = {
  _id: 'set-123',
  startDate: '2024-06-01T00:00:00.000Z',
  endDate: '2024-06-10T00:00:00.000Z',
  price: 100000,
  discountPrice: 90000,
  saleDeadline: '2024-05-25T00:00:00.000Z',
  totalSeats: 15,
  bookedSeats: 5,
  status: 'OPEN',
  isHot: true,
  hotelName: 'Отель Пляж',
  hotelLocation: 'Египет, Хургада',
  airline: 'FlyEgypt',
  flightDetails: 'Прямой рейс из Бишкека',
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedAt: '2024-01-01T12:00:00.000Z',
  tourId: {
    _id: 'tour-1',
    title: 'Роскошный отдых в Египте',
    countryCode: 'EG',
    description: 'Прекрасный десятидневный тур на побережье Красного моря.',
    images: ['img1.jpg'],
    baseAdvantages: ['Всё включено', 'Трансфер из аэропорта'],
    category: { _id: 'cat-1', title: 'Пляжный отдых' },
    rating: 5,
    ratingCount: 10,
    isPublished: true,
    createdAt: '2024-01-01T12:00:00.000Z',
  },
};

describe('TourSetDetailsPage Component', () => {
  const mockBack = vi.fn();

  const setupHooks = ({
                        isLoading = false,
                        isError = false,
                        data = mockTourSet as TourSetType | undefined,
                      } = {}) => {
    vi.mocked(useRouter).mockReturnValue({
      back: mockBack,
    } as never);

    vi.mocked(useParams).mockReturnValue({
      groupID: 'set-123',
    } as never);

    vi.mocked(useOneTourSet).mockReturnValue({
      data,
      isLoading,
      isError,
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupHooks();
  });

  it('показывает индикатор загрузки при получении данных (Loading state)', () => {
    setupHooks({ isLoading: true, data: undefined });

    render(<TourSetDetailsPage />);

    expect(screen.getByText('Загрузка данных потока...')).toBeInTheDocument();
  });

  it('показывает сообщение об ошибке, если поток не найден (Error state)', () => {
    setupHooks({ isError: true, data: undefined });

    render(<TourSetDetailsPage />);

    expect(screen.getByText('Поток тура не найден')).toBeInTheDocument();
  });

  it('отображает детальные данные о потоке тура при успешной загрузке', () => {
    render(<TourSetDetailsPage />);

    expect(screen.getByText('Роскошный отдых в Египте')).toBeInTheDocument();
    expect(screen.getByText('Пляжный отдых')).toBeInTheDocument();
    expect(screen.getByText('Всё включено')).toBeInTheDocument();
    expect(screen.getByText('Трансфер из аэропорта')).toBeInTheDocument();
    expect(screen.getByText('Отель Пляж')).toBeInTheDocument();
    expect(screen.getByText('FlyEgypt')).toBeInTheDocument();
    expect(screen.getByText('Открыт')).toBeInTheDocument();
  });

  it('вызывает метод router.back() при клике на кнопку "Назад"', () => {
    render(<TourSetDetailsPage />);

    const backButton = screen.getByRole('button', { name: /Назад/i });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});