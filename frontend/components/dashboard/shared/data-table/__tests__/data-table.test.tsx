import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../data-table';
import type { ColumnDef } from '@tanstack/react-table';

type Row = { id: string; name: string; age: number };

const data: Row[] = [
  { id: '1', name: 'Иван', age: 30 },
  { id: '2', name: 'Мария', age: 25 },
];

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Имя' },
  { accessorKey: 'age', header: 'Возраст', meta: { className: 'hidden-col' } },
];

describe('DataTable', () => {
  it('рендерит заголовки колонок', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Имя')).toBeInTheDocument();
    expect(screen.getByText('Возраст')).toBeInTheDocument();
  });

  it('рендерит строки данных', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Иван')).toBeInTheDocument();
    expect(screen.getByText('Мария')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('показывает лоадер при isLoading', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} isLoading />,
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Иван')).not.toBeInTheDocument();
  });

  it('показывает "Нет данных" при isError', () => {
    render(<DataTable columns={columns} data={data} isError />);
    expect(screen.getByText('Нет данных')).toBeInTheDocument();
    expect(screen.queryByText('Иван')).not.toBeInTheDocument();
  });

  it('показывает "Нет данных" при пустом массиве', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('Нет данных')).toBeInTheDocument();
  });

  it('вызывает onRowClickAction с данными строки', async () => {
    const onRowClickAction = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        onRowClickAction={onRowClickAction}
      />,
    );

    await userEvent.click(screen.getByText('Иван'));
    expect(onRowClickAction).toHaveBeenCalledWith(data[0]);
  });

  it('применяет rowClassName как строку', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} rowClassName="custom-row" />,
    );
    expect(container.querySelectorAll('.custom-row')).toHaveLength(2);
  });

  it('применяет rowClassName как функцию', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        rowClassName={(row) => (row.age > 28 ? 'senior' : 'junior')}
      />,
    );
    expect(container.querySelectorAll('.senior')).toHaveLength(1);
    expect(container.querySelectorAll('.junior')).toHaveLength(1);
  });

  it('применяет meta.className к ячейкам', () => {
    const { container } = render(<DataTable columns={columns} data={data} />);
    expect(container.querySelectorAll('.hidden-col').length).toBeGreaterThan(0);
  });

  it('проставляет data-label для мобильной раскладки', () => {
    const { container } = render(<DataTable columns={columns} data={data} />);
    expect(container.querySelector('[data-label="Имя"]')).toBeInTheDocument();
  });

  it('не рендерит пагинацию без пропа', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('рендерит пагинацию с пропом', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{
          page: 1,
          limit: 10,
          totalPages: 3,
          onPageChange: vi.fn(),
        }}
      />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('вызывает onPageChange при клике по странице', async () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ page: 1, limit: 10, totalPages: 3, onPageChange }}
      />,
    );

    await userEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
