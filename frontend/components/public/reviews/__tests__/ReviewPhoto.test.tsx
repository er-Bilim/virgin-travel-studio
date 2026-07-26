import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewPhoto from '../ReviewPhoto';
import { apiURL } from '@/lib/constants';

vi.mock('@/components/shared/Rating', () => ({
  default: ({ value }: { value: number }) => (
    <div data-testid="rating">{value}</div>
  ),
}));

describe('ReviewPhoto', () => {
  it('рендерит триггер-кнопку с превью', () => {
    render(<ReviewPhoto src="photo.png" authorName="Людмила" rating={5} />);
    expect(
      screen.getByRole('button', { name: 'Открыть фото от Людмила' }),
    ).toBeInTheDocument();
  });

  it('строит корректный src изображения', () => {
    render(<ReviewPhoto src="photo.png" authorName="Людмила" rating={5} />);
    const img = screen.getByAltText('Фото от Людмила') as HTMLImageElement;
    expect(decodeURIComponent(img.src)).toContain(
      apiURL + '/reviews/image/photo.png',
    );
  });

  it('открывает диалог по клику', async () => {
    render(<ReviewPhoto src="photo.png" authorName="Людмила" rating={5} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Открыть фото от Людмила' }),
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('показывает автора и рейтинг в диалоге', async () => {
    render(
      <ReviewPhoto src="photo.png" authorName="Людмила Андреева" rating={4} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Открыть фото/ }));

    await screen.findByRole('dialog');
    expect(screen.getByText('Людмила Андреева')).toBeInTheDocument();
    expect(screen.getByTestId('rating')).toHaveTextContent('4');
  });

  it('содержит доступный заголовок диалога', async () => {
    render(<ReviewPhoto src="photo.png" authorName="Павел" rating={5} />);
    await userEvent.click(screen.getByRole('button', { name: /Открыть фото/ }));

    expect(await screen.findByText('Фото от Павел')).toBeInTheDocument();
  });

  it('закрывает диалог по кнопке', async () => {
    render(<ReviewPhoto src="photo.png" authorName="Людмила" rating={5} />);
    await userEvent.click(screen.getByRole('button', { name: /Открыть фото/ }));
    await screen.findByRole('dialog');

    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });
});
