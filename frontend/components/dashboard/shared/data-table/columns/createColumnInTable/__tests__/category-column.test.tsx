import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getCategoryColumns } from '../category-column';
import type { TourCategoryType } from '@/types/tour';
import type { ColumnDef } from '@tanstack/react-table';

const baseCategory = {
  _id: 'c1',
  title: 'Экскурсионные',
} as unknown as TourCategoryType;

const renderCell = (
  columns: ColumnDef<TourCategoryType>[],
  id: string,
  category = baseCategory,
) => {
  const column = columns.find((c) => c.id === id || c.header === id)!;
  const cell = column.cell as (p: {
    row: { original: TourCategoryType };
  }) => React.ReactElement;
  return render(cell({ row: { original: category } }));
};

describe('getCategoryColumns', () => {
  it('возвращает две колонки', () => {
    const columns = getCategoryColumns({ onDelete: vi.fn() });
    expect(
      columns.map((c) => (typeof c.header === 'string' ? c.header : c.id)),
    ).toEqual(['Название категории', 'actions']);
  });

  it('показывает название категории', () => {
    const columns = getCategoryColumns({ onDelete: vi.fn() });
    renderCell(columns, 'Название категории');
    expect(screen.getByText('Экскурсионные')).toBeInTheDocument();
  });

  it('рендерит заголовок колонки действий', () => {
    const columns = getCategoryColumns({ onDelete: vi.fn() });
    const column = columns.find((c) => c.id === 'actions')!;
    const header = column.header as () => React.ReactElement;
    render(header());
    expect(screen.getByText('Действия')).toBeInTheDocument();
  });

  it('рендерит кнопку удаления', () => {
    const columns = getCategoryColumns({ onDelete: vi.fn() });
    renderCell(columns, 'actions');
    expect(
      screen.getByRole('button', { name: 'Удалить категорию' }),
    ).toBeInTheDocument();
  });

  it('вызывает onDelete с категорией', async () => {
    const onDelete = vi.fn();
    const columns = getCategoryColumns({ onDelete });
    renderCell(columns, 'actions');

    await userEvent.click(
      screen.getByRole('button', { name: 'Удалить категорию' }),
    );
    expect(onDelete).toHaveBeenCalledWith(baseCategory);
  });
});
