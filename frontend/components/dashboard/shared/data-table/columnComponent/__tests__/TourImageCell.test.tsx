import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourImageCell } from '../TourImageCell';
import type { TourType } from '@/types/tour';

const makeTour = (images: (string | null)[]) =>
  ({
    _id: 't1',
    title: 'Уикенд в Стамбуле',
    images,
  }) as unknown as TourType;

describe('TourImageCell', () => {
  it('показывает заглушку без изображений', () => {
    render(<TourImageCell tour={makeTour([])} />);
    expect(screen.getByText('Нет фото')).toBeInTheDocument();
  });

  it('показывает заглушку, если все изображения null', () => {
    render(<TourImageCell tour={makeTour([null, null])} />);
    expect(screen.getByText('Нет фото')).toBeInTheDocument();
  });

  it('показывает кнопку просмотра при наличии изображений', () => {
    render(<TourImageCell tour={makeTour(['a.png'])} />);
    expect(
      screen.getByRole('button', { name: 'Посмотреть' }),
    ).toBeInTheDocument();
  });

  it('открывает диалог с изображением', async () => {
    render(<TourImageCell tour={makeTour(['a.png'])} />);
    await userEvent.click(screen.getByRole('button', { name: 'Посмотреть' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByAltText('Уикенд в Стамбуле')).toBeInTheDocument();
  });

  it('не показывает навигацию при одном изображении', async () => {
    render(<TourImageCell tour={makeTour(['a.png'])} />);
    await userEvent.click(screen.getByRole('button', { name: 'Посмотреть' }));

    await screen.findByRole('dialog');
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
  });

  it('показывает счётчик при нескольких изображениях', async () => {
    render(<TourImageCell tour={makeTour(['a.png', 'b.png', 'c.png'])} />);
    await userEvent.click(screen.getByRole('button', { name: 'Посмотреть' }));

    expect(await screen.findByText('1 / 3')).toBeInTheDocument();
  });

  it('переключает на следующее изображение', async () => {
    render(<TourImageCell tour={makeTour(['a.png', 'b.png', 'c.png'])} />);
    await userEvent.click(screen.getByRole('button', { name: 'Посмотреть' }));
    await screen.findByText('1 / 3');

    await userEvent.click(screen.getByText('→'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('зацикливает вперёд с последнего на первое', async () => {
    render(<TourImageCell tour={makeTour(['a.png', 'b.png'])} />);
    await userEvent.click(screen.getByRole('button', { name: 'Посмотреть' }));
    await screen.findByText('1 / 2');

    await userEvent.click(screen.getByText('→'));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    await userEvent.click(screen.getByText('→'));
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('зацикливает назад с первого на последнее', async () => {
    render(<TourImageCell tour={makeTour(['a.png', 'b.png', 'c.png'])} />);
    await userEvent.click(screen.getByRole('button', { name: 'Посмотреть' }));
    await screen.findByText('1 / 3');

    await userEvent.click(screen.getByText('←'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('отфильтровывает null из списка изображений', async () => {
    render(<TourImageCell tour={makeTour(['a.png', null, 'b.png'])} />);
    await userEvent.click(screen.getByRole('button', { name: 'Посмотреть' }));

    expect(await screen.findByText('1 / 2')).toBeInTheDocument();
  });
});
