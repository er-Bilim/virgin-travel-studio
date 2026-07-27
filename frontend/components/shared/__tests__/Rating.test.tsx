import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Rating from '@/components/shared/Rating';

describe('Rating', () => {
  it('рендерит 5 звезд по умолчанию', () => {
    render(<Rating value={3} />);
    expect(screen.getAllByRole('button', { name: 'звезда' })).toHaveLength(5);
  });

  it('рендерит указанное количество звёзд', () => {
    render(<Rating value={3} max={10} />);
    expect(screen.getAllByRole('button', { name: 'звезда' })).toHaveLength(10);
  });

  it('по умолчанию звёзды заблокированы (режим только для чтения)', () => {
    render(<Rating value={3} />);
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('при isDisabled=false звёзды кликабельны', () => {
    render(<Rating value={3} isDisabled={false} />);
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  it('по клику вызывает onChangeStarValue с номером звезды', async () => {
    const onChange = vi.fn();
    render(
      <Rating value={0} isDisabled={false} onChangeStarValue={onChange} />,
    );

    await userEvent.click(screen.getAllByRole('button')[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('не вызывает onChangeStarValue когда заблокирован', async () => {
    const onChange = vi.fn();
    render(<Rating value={0} onChangeStarValue={onChange} />);

    await userEvent.click(screen.getAllByRole('button')[2]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('не падает без onChangeStarValue', async () => {
    render(<Rating value={0} isDisabled={false} />);
    await expect(
      userEvent.click(screen.getAllByRole('button')[0]),
    ).resolves.not.toThrow();
  });

  it('показывает подпись из ratingOptions', () => {
    const options = [
      { label: 'Ужасно', color: 'text-red-500' },
      { label: 'Плохо', color: 'text-orange-500' },
      { label: 'Нормально', color: 'text-yellow-500' },
      { label: 'Хорошо', color: 'text-lime-500' },
      { label: 'Отлично', color: 'text-green-500' },
    ];
    render(<Rating value={2} ratingOptions={options} />);
    expect(screen.getByText('Нормально')).toBeInTheDocument();
  });

  it('не показывает подпись, если для value нет опции', () => {
    const options = [{ label: 'Ужасно', color: 'text-red-500' }];
    render(<Rating value={4} ratingOptions={options} />);
    expect(screen.queryByText('Ужасно')).not.toBeInTheDocument();
  });

  it('показывает текст ошибки', () => {
    render(<Rating value={0} error="Поставьте оценку" />);
    expect(screen.getByText('Поставьте оценку')).toBeInTheDocument();
  });

  it('не показывает блок ошибки без error', () => {
    render(<Rating value={3} />);
    expect(screen.queryByText(/Поставьте/)).not.toBeInTheDocument();
  });
});
