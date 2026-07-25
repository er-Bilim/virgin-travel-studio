import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TourGallery from '../TourGallery';
import { imageUrl } from '@/lib/constants';

describe('TourGallery', () => {
  it('показывает заглушку без изображений', () => {
    const { container } = render(<TourGallery images={[]} title="Тур" />);
    expect(container.querySelector('.lucide-image-off')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('показывает заглушку при images undefined', () => {
    const { container } = render(
      <TourGallery images={undefined as never} title="Тур" />,
    );
    expect(container.querySelector('.lucide-image-off')).toBeInTheDocument();
  });

  it('рендерит главное изображение', () => {
    render(<TourGallery images={['a.png']} title="Стамбул" />);
    const main = screen.getByAltText('Стамбул — фото 1') as HTMLImageElement;
    expect(main).toBeInTheDocument();
    expect(decodeURIComponent(main.src)).toContain(
      imageUrl + 'api/tours/image/a.png',
    );
  });

  it('не показывает миниатюры при одном изображении', () => {
    render(<TourGallery images={['a.png']} title="Тур" />);
    expect(
      screen.queryByRole('button', { name: /Фото 1 из/ }),
    ).not.toBeInTheDocument();
  });

  it('показывает миниатюры при нескольких изображениях', () => {
    render(<TourGallery images={['a.png', 'b.png', 'c.png']} title="Тур" />);
    expect(
      screen.getByRole('button', { name: 'Фото 1 из 3' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Фото 3 из 3' }),
    ).toBeInTheDocument();
  });

  it('первая миниатюра активна по умолчанию', () => {
    render(<TourGallery images={['a.png', 'b.png']} title="Тур" />);
    expect(screen.getByRole('button', { name: 'Фото 1 из 2' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Фото 2 из 2' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('переключает главное изображение по клику на миниатюру', async () => {
    render(<TourGallery images={['a.png', 'b.png']} title="Стамбул" />);

    await userEvent.click(screen.getByRole('button', { name: 'Фото 2 из 2' }));

    expect(screen.getByRole('button', { name: 'Фото 2 из 2' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getAllByAltText('Стамбул — фото 2')[0]).toBeInTheDocument();
  });

  it('меняет src главного изображения при выборе миниатюры', async () => {
    render(<TourGallery images={['a.png', 'b.png']} title="Тур" />);
    await userEvent.click(screen.getByRole('button', { name: 'Фото 2 из 2' }));

    const main = screen.getAllByAltText('Тур — фото 2')[0] as HTMLImageElement;
    expect(decodeURIComponent(main.src)).toContain(
      imageUrl + 'api/tours/image/b.png',
    );
  });
});
