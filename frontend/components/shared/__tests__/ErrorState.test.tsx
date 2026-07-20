import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorState from '@/components/shared/ErrorState';

describe('ErrorState', () => {
  const onRetry = vi.fn();
  it('зовёт onRetry по клику', async () => {
    render(<ErrorState onRetry={onRetry} />);
    await userEvent.click(screen.getByText('Повторить'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('рендерит заголовок и описание ошибки', async () => {
    render(<ErrorState onRetry={onRetry} />);
    screen.debug();
    expect(
      screen.getByRole('heading', { name: 'Не удалось загрузить', level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/проверьте подключение к интернету/i),
    ).toBeInTheDocument();
  });
  it('рендерит кнпоку "Повторить" с правильным типом', () => {
    render(<ErrorState onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: 'Повторить' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });
});
