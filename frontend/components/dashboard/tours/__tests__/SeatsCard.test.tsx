import { render, screen } from '@testing-library/react';
import SeatsCard from '../SeatsCard';

describe('SeatsCard', () => {
  it('показывает количество свободных мест', () => {
    render(<SeatsCard totalSeats={20} bookedSeats={18} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('показывает общее количество мест', () => {
    render(<SeatsCard totalSeats={20} bookedSeats={18} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('показывает заголовок карточки', () => {
    render(<SeatsCard totalSeats={20} bookedSeats={5} />);
    expect(screen.getByText('Свободные места')).toBeInTheDocument();
  });

  it('при нуле свободных показывает баннер "Мест нет"', () => {
    render(<SeatsCard totalSeats={20} bookedSeats={20} />);
    expect(screen.getByText('Мест нет')).toBeInTheDocument();
    expect(screen.getByText(/Все 20 мест заняты/)).toBeInTheDocument();
  });

  it('при наличии мест баннер не показывается', () => {
    render(<SeatsCard totalSeats={20} bookedSeats={5} />);
    expect(screen.queryByText('Мест нет')).not.toBeInTheDocument();
  });
});
