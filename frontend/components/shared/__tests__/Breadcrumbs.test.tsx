import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

describe('Breadcrumbs', () => {
  it('рендерит все переданные метки', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Новости', href: '/news' },
          { label: 'Заголовок статьи' },
        ]}
      />,
    );
    expect(screen.getByText('Новости')).toBeInTheDocument();
    expect(screen.getByText('Заголовок статьи')).toBeInTheDocument();
  });

  it('делает промежуточные элементы ссылками', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Новости', href: '/news' }, { label: 'Статья' }]}
      />,
    );
    const link = screen.getByRole('link', { name: 'Новости' });
    expect(link).toHaveAttribute('href', '/news');
  });

  it('последний элемент - не ссылка (текущая страница)', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Новости', href: '/news' }, { label: 'Статья' }]}
      />,
    );
    expect(
      screen.queryByRole('span', { name: 'Статья' }),
    ).not.toBeInTheDocument();
  });

  it('не делает ссылкой элемент без href', () => {
    render(
      <Breadcrumbs items={[{ label: 'Просто текст' }, { label: 'Ещё' }]} />,
    );
    expect(
      screen.queryByRole('span', { name: 'Просто текст' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Просто текст')).toBeInTheDocument();
  });

  it('последний элемент не ссылка, даже если у него есть href', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Конец', href: '/end' },
        ]}
      />,
    );
    expect(
      screen.queryByRole('span', { name: 'Конец' }),
    ).not.toBeInTheDocument();
  });
});
