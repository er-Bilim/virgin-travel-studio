import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginationCustom } from '../PaginationCustom';

describe('PaginationCustom', () => {
  const setup = (page: number, totalPage: number) => {
    const onChange = vi.fn();
    render(
      <PaginationCustom
        page={page}
        limit={9}
        totalPage={totalPage}
        onChange={onChange}
      />,
    );
    return { onChange };
  };

  it('рендерит номера страниц вокруг текущей', () => {
    setup(5, 10);
    ['3', '4', '5', '6', '7'].forEach((number) => {
      expect(screen.getByText(number)).toBeInTheDocument();
    });
  });

  it('всегда показывает первую и последнюю страницу', () => {
    setup(5, 20);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('подставляет число вместо точек при разрыве в одну страницу', () => {
    setup(5, 10);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('показывает многоточие при большом разрыве', () => {
    const { container } = render(
      <PaginationCustom page={1} limit={9} totalPage={20} onChange={vi.fn()} />,
    );
    expect(screen.queryByText('10')).not.toBeInTheDocument();
    expect(container.textContent).toContain('More pages');
  });

  it('при одной странице показывает только её', () => {
    setup(1, 1);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('помечает текущую страницу как активную', () => {
    setup(5, 10);
    expect(screen.getByText('5').closest('a')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('по клику на номер вызывает onChange с этой страницей', async () => {
    const { onChange } = setup(5, 10);
    await userEvent.click(screen.getByText('7'));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('не вызывает onChange для страницы 0 (кнопка "назад" на первой)', async () => {
    const { onChange } = setup(1, 10);
    const links = screen.getAllByRole('link');
    await userEvent.click(links[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('не вызывает onChange за пределом последней страницы', async () => {
    const { onChange } = setup(10, 10);
    const links = screen.getAllByRole('link');
    await userEvent.click(links[links.length - 1]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('кнопка "вперёд" переключает на следующую', async () => {
    const { onChange } = setup(3, 10);
    const links = screen.getAllByRole('link');
    await userEvent.click(links[links.length - 1]);
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
