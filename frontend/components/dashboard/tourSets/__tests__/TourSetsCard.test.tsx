import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import {TourSetsCard} from "@/components/dashboard/tourSets/TourSetsCard";

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

vi.mock('@/components/assets/lake.webp', () => ({
  default: { src: '/mock-base-photo.webp' },
}));

const pushMock = vi.fn();
const openModalMock = vi.fn();

const mockTourSet = {
  _id: 'ts-123',
  startDate: '2025-06-01T00:00:00.000Z',
  endDate: '2025-06-10T00:00:00.000Z',
  price: 15000,
  totalSeats: 10,
  bookedSeats: 4,
  isHot: true,
  tourId: {
    _id: 'tour-999',
    title: 'Захватывающий тур',
    images: ['tour-img.jpg'],
    baseAdvantages: ['Завтрак включен', 'Экскурсия'],
  },
};

const setup = (tourSetData = mockTourSet) => {
  vi.mocked(useRouter).mockReturnValue({
    push: pushMock,
  } as never);

  return render(
    <TourSetsCard tourSet={tourSetData as never} openModal={openModalMock} />,
  );
};

describe('TourSetsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает информацию о потоке и туре', () => {
    setup();

    expect(screen.getByText('Захватывающий тур')).toBeInTheDocument();
    expect(screen.getByText('15000 сом')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Hot')).toBeInTheDocument();
    expect(screen.getByText('Завтрак включен')).toBeInTheDocument();
    expect(screen.getByText('Экскурсия')).toBeInTheDocument();
  });

  it('использует дефолтное фото, если у тура нет изображений', () => {
    const tourSetWithoutImages = {
      ...mockTourSet,
      tourId: {
        ...mockTourSet.tourId,
        images: [],
      },
    };

    setup(tourSetWithoutImages);

    const image = screen.getByAltText('tour');
    expect(image).toHaveAttribute('src', '/mock-base-photo.webp');
  });

  it('не отображает плашку Hot, если тур не горящий', () => {
    const tourSetNotHot = {
      ...mockTourSet,
      isHot: false,
    };

    setup(tourSetNotHot);

    expect(screen.queryByText('Hot')).not.toBeInTheDocument();
  });

  it('переходит на страницу тура при клике на карточку', async () => {
    setup();

    const card = screen.getByRole('button', { name: /Захватывающий тур/i });
    await userEvent.click(card);

    expect(pushMock).toHaveBeenCalledWith('/tours/tour-999');
  });

  it('переходит на страницу тура при нажатии Enter или Space', async () => {
    setup();

    const card = screen.getByRole('button', { name: /Захватывающий тур/i });
    card.focus();

    await userEvent.keyboard('{Enter}');
    expect(pushMock).toHaveBeenCalledWith('/tours/tour-999');

    await userEvent.keyboard(' ');
    expect(pushMock).toHaveBeenCalledTimes(2);
  });

  it('вызывает openModal при клике на Оставить заявку без перехода на страницу тура', async () => {
    setup();

    const applyButton = screen.getByRole('button', {
      name: 'Оставить заявку',
    });
    await userEvent.click(applyButton);

    expect(openModalMock).toHaveBeenCalledWith('ts-123');
    expect(pushMock).not.toHaveBeenCalled();
  });
});