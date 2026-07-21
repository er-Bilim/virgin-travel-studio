import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Compass, RotateCw } from 'lucide-react';
import StateCard from '../StateCard';

describe('StateCard', () => {
  const defaults = {
    icon: Compass,
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить фильтры',
  };

  it('показывает заголовок и описание', () => {
    render(<StateCard {...defaults} />);
    expect(
      screen.getByRole('heading', { name: 'Ничего не найдено' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Попробуйте изменить фильтры')).toBeInTheDocument();
  });

  it('без actions не рендерит кнопки и ссылки', () => {
    render(<StateCard {...defaults} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('рендерит action типа link с href', () => {
    render(
      <StateCard
        {...defaults}
        actions={[{ type: 'link', href: '/tours', label: 'Смотреть туры' }]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Смотреть туры' })).toHaveAttribute(
      'href',
      '/tours',
    );
  });

  it('рендерит action типа button', () => {
    render(
      <StateCard
        {...defaults}
        actions={[{ type: 'button', onClick: vi.fn(), label: 'Повторить' }]}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Повторить' }),
    ).toBeInTheDocument();
  });

  it('вызывает onClick по клику', async () => {
    const onClick = vi.fn();
    render(
      <StateCard
        {...defaults}
        actions={[{ type: 'button', onClick, label: 'Повторить' }]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('рендерит несколько actions разных типов', () => {
    render(
      <StateCard
        {...defaults}
        actions={[
          { type: 'link', href: '/tours', label: 'Туры' },
          { type: 'button', onClick: vi.fn(), label: 'Повторить' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Туры' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Повторить' }),
    ).toBeInTheDocument();
  });

  it('рендерит иконку внутри action', () => {
    const { container } = render(
      <StateCard
        {...defaults}
        actions={[
          {
            type: 'button',
            onClick: vi.fn(),
            label: 'Повторить',
            icon: RotateCw,
          },
        ]}
      />,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(1);
  });
});
