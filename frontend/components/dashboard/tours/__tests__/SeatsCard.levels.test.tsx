import { render, screen } from '@testing-library/react';
import SeatsCard from '../SeatsCard';
import getSeatsLevel from '@/lib/tour/seats';

vi.mock('@/lib/tour/seats', () => ({
  default: vi.fn(),
}));

describe('SeatsCard - тексты уровней', () => {
  it('available: обычный текст брони', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('available');
    render(<SeatsCard totalSeats={20} bookedSeats={5} />);
    expect(screen.getByText('Забронировано 5 из 20')).toBeInTheDocument();
  });

  it('low: текст про среднее количество', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('low');
    render(<SeatsCard totalSeats={20} bookedSeats={12} />);
    expect(screen.getByText(/Среднее количество мест/)).toBeInTheDocument();
  });

  it('critical: текст про малое количество', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('critical');
    render(<SeatsCard totalSeats={20} bookedSeats={18} />);
    expect(screen.getByText(/Осталось мало мест/)).toBeInTheDocument();
  });

  it('sold-out: текста уровня нет, только баннер', () => {
    vi.mocked(getSeatsLevel).mockReturnValue('sold-out');
    render(<SeatsCard totalSeats={20} bookedSeats={20} />);
    expect(screen.getByText('Мест нет')).toBeInTheDocument();
  });
  it('не падает при totalSeats = 0', () => {
    expect(() =>
      render(<SeatsCard totalSeats={0} bookedSeats={0} />),
    ).not.toThrow();
  });
});
