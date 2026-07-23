import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getManagersColumns } from '../manager-colum';
import type { IUser } from '@/types/user';
import type { ColumnDef } from '@tanstack/react-table';

const baseUser = {
  _id: 'u1',
  fullName: 'Иван Петров',
  phone: '+996703754456',
  status: 'active',
} as unknown as IUser;

const handlers = () => ({ onView: vi.fn(), onBanned: vi.fn() });

const renderActions = (columns: ColumnDef<IUser>[], user = baseUser) => {
  const column = columns.find((c) => c.id === 'actions')!;
  const cell = column.cell as (p: {
    row: { original: IUser };
  }) => React.ReactElement;
  return render(cell({ row: { original: user } }));
};

describe('getManagersColumns', () => {
  it('возвращает колонки в ожидаемом порядке', () => {
    const columns = getManagersColumns(handlers());
    expect(
      columns.map((c) => (typeof c.header === 'string' ? c.header : c.id)),
    ).toEqual(['ФИО', 'Телефон', 'Статус', 'actions']);
  });

  it('колонки ФИО и телефона используют accessorKey', () => {
    const columns = getManagersColumns(handlers());
    expect((columns[0] as { accessorKey: string }).accessorKey).toBe(
      'fullName',
    );
    expect((columns[1] as { accessorKey: string }).accessorKey).toBe('phone');
  });

  it('рендерит заголовок колонки действий', () => {
    const columns = getManagersColumns(handlers());
    const column = columns.find((c) => c.id === 'actions')!;
    const header = column.header as () => React.ReactElement;
    render(header());
    expect(screen.getByText('Действия')).toBeInTheDocument();
  });

  describe('статус', () => {
    it('рендерит бейдж статуса', () => {
      const columns = getManagersColumns(handlers());
      const column = columns.find((c) => c.header === 'Статус')!;
      const cell = column.cell as (p: {
        row: { original: IUser };
      }) => React.ReactElement;
      render(cell({ row: { original: baseUser } }));
      expect(screen.getByText(/актив/i)).toBeInTheDocument();
    });

    it('неизвестный статус выводится как есть', () => {
      const columns = getManagersColumns(handlers());
      const column = columns.find((c) => c.header === 'Статус')!;
      const cell = column.cell as (p: {
        row: { original: IUser };
      }) => React.ReactElement;
      render(
        cell({
          row: {
            original: { ...baseUser, status: 'weird' } as unknown as IUser,
          },
        }),
      );
      expect(screen.getByText('weird')).toBeInTheDocument();
    });
  });

  describe('действия', () => {
    it('показывает кнопку просмотра профиля', () => {
      renderActions(getManagersColumns(handlers()));
      expect(
        screen.getByRole('button', { name: 'Посмотреть профиль' }),
      ).toBeInTheDocument();
    });

    it('для активного показывает кнопку блокировки', () => {
      renderActions(getManagersColumns(handlers()), {
        ...baseUser,
        status: 'active',
      } as IUser);
      expect(
        screen.getByRole('button', { name: 'Заблокировать пользователя' }),
      ).toBeInTheDocument();
    });

    it('для заблокированного показывает кнопку разблокировки', () => {
      renderActions(getManagersColumns(handlers()), {
        ...baseUser,
        status: 'banned',
      } as IUser);
      expect(
        screen.getByRole('button', { name: 'Разблокировать пользователя' }),
      ).toBeInTheDocument();
    });

    it('вызывает onView с пользователем', async () => {
      const h = handlers();
      renderActions(getManagersColumns(h));
      await userEvent.click(
        screen.getByRole('button', { name: 'Посмотреть профиль' }),
      );
      expect(h.onView).toHaveBeenCalledWith(baseUser);
    });

    it('вызывает onBanned с пользователем', async () => {
      const h = handlers();
      renderActions(getManagersColumns(h));
      await userEvent.click(
        screen.getByRole('button', { name: 'Заблокировать пользователя' }),
      );
      expect(h.onBanned).toHaveBeenCalledWith(baseUser);
    });

    it('вызывает onBanned для разблокировки', async () => {
      const h = handlers();
      renderActions(getManagersColumns(h), {
        ...baseUser,
        status: 'banned',
      } as IUser);
      await userEvent.click(
        screen.getByRole('button', { name: 'Разблокировать пользователя' }),
      );
      expect(h.onBanned).toHaveBeenCalledWith({
        ...baseUser,
        status: 'banned',
      });
    });
  });
});
