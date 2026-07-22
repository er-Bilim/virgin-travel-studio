import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getOrdersColumns } from '../order-columns';
import type { OrderType } from '@/types/order';
import type { ColumnDef, CellContext } from '@tanstack/react-table';

const baseOrder = {
  _id: 'o1',
  visibleId: 'ORDER-2026-039',
  createdAt: '2026-07-08T12:00:00Z',
  managerId: { fullName: 'admin' },
  clientName: 'Людмила Андреева',
  clientPhone: '+79991112233',
  status: 'IN_PROGRESS',
} as unknown as OrderType;

const handlers = () => ({
  onView: vi.fn(),
  onDelete: vi.fn(),
  onTake: vi.fn(),
});

const findColumn = (columns: ColumnDef<OrderType>[], header: string) =>
  columns.find((c) => c.header === header)!;

const renderCellWithValue = (
  column: ColumnDef<OrderType>,
  order: OrderType,
  value: unknown,
) => {
  const cell = column.cell as (
    ctx: Partial<CellContext<OrderType, unknown>>,
  ) => React.ReactElement;
  return render(
    cell({
      row: { original: order } as never,
      getValue: (() => value) as never,
    }),
  );
};

const renderActions = (columns: ColumnDef<OrderType>[], order = baseOrder) => {
  const actions = columns.find((c) => c.id === 'Действия')!;
  const cell = actions.cell as (p: {
    row: { original: OrderType };
  }) => React.ReactElement;
  return render(cell({ row: { original: order } }));
};

describe('getOrdersColumns', () => {
  describe('колонка менеджера', () => {
    it('показывается для ADMIN', () => {
      const columns = getOrdersColumns({ ...handlers(), role: 'ADMIN' });
      expect(columns.some((c) => c.header === 'Менеджер')).toBe(true);
    });

    it('скрыта для не-ADMIN', () => {
      const columns = getOrdersColumns({ ...handlers(), role: 'MANAGER' });
      expect(columns.some((c) => c.header === 'Менеджер')).toBe(false);
    });

    it('показывает имя менеджера', () => {
      const columns = getOrdersColumns({ ...handlers(), role: 'ADMIN' });
      renderCellWithValue(findColumn(columns, 'Менеджер'), baseOrder, {
        fullName: 'admin',
      });
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('показывает "Не назначен" без менеджера', () => {
      const columns = getOrdersColumns({ ...handlers(), role: 'ADMIN' });
      renderCellWithValue(findColumn(columns, 'Менеджер'), baseOrder, null);
      expect(screen.getByText('Не назначен')).toBeInTheDocument();
    });
  });

  it('форматирует дату создания', () => {
    const columns = getOrdersColumns({ ...handlers(), role: 'ADMIN' });
    renderCellWithValue(
      findColumn(columns, 'Дата создания'),
      baseOrder,
      '2026-07-08T12:00:00Z',
    );
    expect(screen.getByText(/08\.07\.2026/)).toBeInTheDocument();
  });

  it('рендерит статус через бейдж', () => {
    const columns = getOrdersColumns({ ...handlers(), role: 'ADMIN' });
    const column = findColumn(columns, 'Статус');
    const cell = column.cell as (p: {
      row: { original: OrderType };
    }) => React.ReactElement;
    render(cell({ row: { original: baseOrder } }));
    expect(screen.getByText('В работе')).toBeInTheDocument();
  });

  it('неизвестный статус выводится как есть', () => {
    const columns = getOrdersColumns({ ...handlers(), role: 'ADMIN' });
    const column = findColumn(columns, 'Статус');
    const cell = column.cell as (p: {
      row: { original: OrderType };
    }) => React.ReactElement;
    render(
      cell({
        row: { original: { ...baseOrder, status: 'WEIRD' } as OrderType },
      }),
    );
    expect(screen.getByText('WEIRD')).toBeInTheDocument();
  });

  describe('действия', () => {
    it('на вкладке "all" для менеджера показывает "Взять заявку", без "Просмотр"', () => {
      const columns = getOrdersColumns({
        ...handlers(),
        role: 'MANAGER',
        currentTab: 'all',
      });
      renderActions(columns);
      expect(
        screen.getByRole('button', { name: 'Взять заявку' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Просмотр' }),
      ).not.toBeInTheDocument();
    });

    it('на вкладке "all" для ADMIN показывает и "Просмотр", и "Взять заявку"', () => {
      const columns = getOrdersColumns({
        ...handlers(),
        role: 'ADMIN',
        currentTab: 'all',
      });
      renderActions(columns);
      expect(
        screen.getByRole('button', { name: 'Просмотр' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Взять заявку' }),
      ).toBeInTheDocument();
    });

    it('на других вкладках показывает "Просмотр", без "Взять заявку"', () => {
      const columns = getOrdersColumns({
        ...handlers(),
        role: 'MANAGER',
        currentTab: 'my',
      });
      renderActions(columns);
      expect(
        screen.getByRole('button', { name: 'Просмотр' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Взять заявку' }),
      ).not.toBeInTheDocument();
    });

    it('всегда показывает "Удалить"', () => {
      const columns = getOrdersColumns({
        ...handlers(),
        role: 'MANAGER',
        currentTab: 'all',
      });
      renderActions(columns);
      expect(
        screen.getByRole('button', { name: 'Удалить' }),
      ).toBeInTheDocument();
    });

    it('вызывает onView с заявкой', async () => {
      const h = handlers();
      const columns = getOrdersColumns({
        ...h,
        role: 'ADMIN',
        currentTab: 'my',
      });
      renderActions(columns);
      await userEvent.click(screen.getByRole('button', { name: 'Просмотр' }));
      expect(h.onView).toHaveBeenCalledWith(baseOrder);
    });

    it('вызывает onTake с заявкой', async () => {
      const h = handlers();
      const columns = getOrdersColumns({
        ...h,
        role: 'MANAGER',
        currentTab: 'all',
      });
      renderActions(columns);
      await userEvent.click(
        screen.getByRole('button', { name: 'Взять заявку' }),
      );
      expect(h.onTake).toHaveBeenCalledWith(baseOrder);
    });

    it('вызывает onDelete с заявкой', async () => {
      const h = handlers();
      const columns = getOrdersColumns({
        ...h,
        role: 'ADMIN',
        currentTab: 'my',
      });
      renderActions(columns);
      await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));
      expect(h.onDelete).toHaveBeenCalledWith(baseOrder);
    });
  });
});
