import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getStatusBadge, getTourSetsColumns } from '../tour-sets-columns';
import type { TourSetType } from '@/types/tourSets';
import type { ColumnDef } from '@tanstack/react-table';

vi.mock('@/components/ui/tooltip-custom', () => ({
  TooltipCustom: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const baseSet = {
  _id: 'set-1',
  startDate: '2026-09-10T12:00:00Z',
  endDate: '2026-09-13T12:00:00Z',
  hotelName: 'Legacy Ottoman Hotel',
  price: 45000,
  discountPrice: null,
  status: 'OPEN',
  isHot: false,
} as unknown as TourSetType;

const handlers = () => ({
  onReport: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
});

const renderCellByHeader = (
  columns: ColumnDef<TourSetType>[],
  header: string,
  row: TourSetType,
) => {
  const column = columns.find((c) => c.header === header)!;
  const cell = column.cell as (props: {
    row: { original: TourSetType };
  }) => React.ReactElement;
  return render(cell({ row: { original: row } }));
};

describe('getStatusBadge', () => {
  it('OPEN — Открыт', () => {
    render(getStatusBadge('OPEN'));
    expect(screen.getByText('Открыт')).toBeInTheDocument();
  });

  it('CLOSED — Мест нет', () => {
    render(getStatusBadge('CLOSED'));
    expect(screen.getByText('Мест нет')).toBeInTheDocument();
  });

  it('FINISHED — Завершен', () => {
    render(getStatusBadge('FINISHED'));
    expect(screen.getByText('Завершен')).toBeInTheDocument();
  });

  it('неизвестный статус выводится как есть', () => {
    render(getStatusBadge('UNKNOWN'));
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });
});

describe('getTourSetsColumns', () => {
  it('возвращает колонки в ожидаемом порядке', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    expect(
      columns.map((c) => (typeof c.header === 'string' ? c.header : c.id)),
    ).toEqual(['Старт', 'Конец', 'Отель', 'Стоимость', 'Статус', 'Действия']);
  });

  it('форматирует дату старта', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    renderCellByHeader(columns, 'Старт', baseSet);
    expect(screen.getByText('10.09.2026')).toBeInTheDocument();
  });

  it('форматирует дату окончания', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    renderCellByHeader(columns, 'Конец', baseSet);
    expect(screen.getByText('13.09.2026')).toBeInTheDocument();
  });

  it('не показывает бейдж HOT по умолчанию', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    renderCellByHeader(columns, 'Старт', baseSet);
    expect(screen.queryByText('HOT')).not.toBeInTheDocument();
  });

  it('показывает бейдж HOT при isHot', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    renderCellByHeader(columns, 'Старт', { ...baseSet, isHot: true });
    expect(screen.getByText('HOT')).toBeInTheDocument();
  });

  it('показывает название отеля', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    renderCellByHeader(columns, 'Отель', baseSet);
    expect(screen.getByText('Legacy Ottoman Hotel')).toBeInTheDocument();
  });

  it('без скидки показывает одну цену', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    renderCellByHeader(columns, 'Стоимость', baseSet);
    expect(screen.getByText(/45[\s\u00A0]000 KGS/)).toBeInTheDocument();
  });

  it('со скидкой показывает обе цены', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    renderCellByHeader(columns, 'Стоимость', {
      ...baseSet,
      price: 100000,
      discountPrice: 90000,
    });
    expect(screen.getByText(/90[\s\u00A0]000 KGS/)).toBeInTheDocument();
    expect(screen.getByText(/100[\s ]?000 KGS/)).toBeInTheDocument();
  });

  it('рендерит статус в колонке', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    renderCellByHeader(columns, 'Статус', { ...baseSet, status: 'CLOSED' });
    expect(screen.getByText('Мест нет')).toBeInTheDocument();
  });

  it('показывает все действия при canDelete', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: true });
    const actionsColumn = columns.find((c) => c.id === 'Действия')!;
    const cell = actionsColumn.cell as (p: {
      row: { original: TourSetType };
    }) => React.ReactElement;
    render(cell({ row: { original: baseSet } }));

    expect(
      screen.getByRole('button', { name: 'Отчет по потоку тура' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Просмотреть' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Редактировать' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument();
  });

  it('скрывает удаление при canDelete=false', () => {
    const columns = getTourSetsColumns({ ...handlers(), canDelete: false });
    const actionsColumn = columns.find((c) => c.id === 'Действия')!;
    const cell = actionsColumn.cell as (p: {
      row: { original: TourSetType };
    }) => React.ReactElement;
    render(cell({ row: { original: baseSet } }));

    expect(
      screen.queryByRole('button', { name: 'Удалить' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Редактировать' }),
    ).toBeInTheDocument();
  });

  it('вызывает обработчики с данными строки', async () => {
    const h = handlers();
    const columns = getTourSetsColumns({ ...h, canDelete: true });
    const actionsColumn = columns.find((c) => c.id === 'Действия')!;
    const cell = actionsColumn.cell as (p: {
      row: { original: TourSetType };
    }) => React.ReactElement;
    render(cell({ row: { original: baseSet } }));

    await userEvent.click(
      screen.getByRole('button', { name: 'Редактировать' }),
    );
    expect(h.onEdit).toHaveBeenCalledWith(baseSet);

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));
    expect(h.onDelete).toHaveBeenCalledWith(baseSet);
  });
});
