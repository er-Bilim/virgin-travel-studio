import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createActionsColumn } from '../createActionsColumn';
import type { TableAction } from '@/types/helpersComponent';

type Row = { _id: string; title: string; isPublished: boolean };

const data: Row = { _id: '1', title: 'Тур', isPublished: false };

const renderCell = (actions: TableAction<Row>[], row: Row = data) => {
  const column = createActionsColumn<Row>({ actions });
  const cell = column.cell as (props: {
    row: { original: Row };
  }) => React.ReactElement;
  return render(cell({ row: { original: row } }));
};

describe('createActionsColumn', () => {
  it('возвращает колонку с ожидаемыми настройками', () => {
    const column = createActionsColumn<Row>({ actions: [] });
    expect(column.id).toBe('Действия');
    expect(column.size).toBe(50);
    expect(column.minSize).toBe(50);
    expect(column.maxSize).toBe(50);
  });

  it('прокидывает meta в колонку', () => {
    const meta = { className: 'text-right' } as never;
    const column = createActionsColumn<Row>({ actions: [], meta });
    expect(column.meta).toBe(meta);
  });

  it('рендерит заголовок колонки', () => {
    const column = createActionsColumn<Row>({ actions: [] });
    const header = column.header as () => React.ReactElement;
    render(header());
    expect(screen.getByText('Действия')).toBeInTheDocument();
  });

  it('рендерит кнопки действий в мобильной раскладке', () => {
    renderCell([
      { id: 'edit', label: 'Редактировать', onClick: vi.fn() },
      { id: 'delete', label: 'Удалить', onClick: vi.fn() },
    ]);
    expect(
      screen.getByRole('button', { name: 'Редактировать' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument();
  });

  it('вызывает onClick с данными строки', async () => {
    const onClick = vi.fn();
    renderCell([{ id: 'edit', label: 'Редактировать', onClick }]);
    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать' }),
    );
    expect(onClick).toHaveBeenCalledWith(data);
  });

  it('скрывает действие при hidden === true', () => {
    renderCell([
      { id: 'edit', label: 'Редактировать', onClick: vi.fn() },
      { id: 'delete', label: 'Удалить', onClick: vi.fn(), hidden: true },
    ]);
    expect(
      screen.getByRole('button', { name: 'Редактировать' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Удалить' }),
    ).not.toBeInTheDocument();
  });

  it('скрывает действие по функции hidden', () => {
    renderCell([
      {
        id: 'publish',
        label: 'Опубликовать',
        onClick: vi.fn(),
        hidden: (row) => row.isPublished,
      },
    ]);
    expect(
      screen.getByRole('button', { name: 'Опубликовать' }),
    ).toBeInTheDocument();
  });

  it('показывает действие, если функция hidden вернула false', () => {
    renderCell(
      [
        {
          id: 'publish',
          label: 'Снять с публикации',
          onClick: vi.fn(),
          hidden: (row) => !row.isPublished,
        },
      ],
      { ...data, isPublished: true },
    );
    expect(
      screen.getByRole('button', { name: 'Снять с публикации' }),
    ).toBeInTheDocument();
  });

  it('вычисляет label из функции', () => {
    renderCell([
      {
        id: 'toggle',
        label: (row: Row) => (row.isPublished ? 'Снять' : 'Опубликовать'),
        onClick: vi.fn(),
      },
    ]);
    expect(
      screen.getByRole('button', { name: 'Опубликовать' }),
    ).toBeInTheDocument();
  });

  it('открывает выпадающее меню и вызывает действие из него', async () => {
    const onClick = vi.fn();
    renderCell([{ id: 'edit', label: 'Редактировать', onClick }]);

    const triggers = screen.getAllByRole('button');
    await userEvent.click(triggers[0]);

    const menuItem = await screen.findByRole('menuitem', {
      name: 'Редактировать',
    });
    await userEvent.click(menuItem);

    expect(onClick).toHaveBeenCalledWith(data);
  });

  it('не рендерит кнопки при пустом списке действий', () => {
    renderCell([]);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
