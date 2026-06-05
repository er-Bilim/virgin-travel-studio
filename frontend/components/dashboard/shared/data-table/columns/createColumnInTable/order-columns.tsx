import type {OrderType} from '@/types/order';
import type {CellContext, ColumnDef} from '@tanstack/react-table';
import {
  createActionsColumn
} from '@/components/dashboard/shared/data-table/columns/createActionsColumn';

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  type OrderStatus
} from '@/lib/constants';
import {Badge} from '@/components/ui/badge';
import dayjs from 'dayjs';

export const getOrdersColumns = ({
  onView,
  onDelete,
  role,
  currentTab,
  onTake,
}: {
  role?: string;
  onView: (order: OrderType) => void;
  onDelete: (order: OrderType) => void;
  currentTab?: string;
  onTake: (order: OrderType) => void;
}): ColumnDef<OrderType>[] => [
  {
    accessorKey: 'visibleId',
    header: 'ID',
    meta: { className: 'hidden xl:table-cell' },
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата создания',
    meta: { className: 'hidden 2xl:table-cell' },
    cell: ({ getValue }) => {
      const rawDate = getValue<string>();
      return dayjs(rawDate).format('DD.MM.YYYY (HH:mm)');
    },
  },
  ...(role === 'ADMIN'
    ? [
        {
          accessorKey: 'managerId',
          header: 'Менеджер',
          meta: { className: 'hidden sm:table-cell' },
          cell: ({ getValue }: CellContext<OrderType, unknown>) => {
            const manager = getValue() as { fullName: string } | null;
            if (!manager) {
              return 'Не назначен';
            }
            return manager.fullName;
          },
        },
      ]
    : []),
  {
    accessorKey: 'clientName',
    header: 'Клиент',
  },
  {
    accessorKey: 'clientPhone',
    header: 'Телефон',
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.original.status as OrderStatus;
      return (
        <Badge
          className={`${ORDER_STATUS_STYLES[status]} border-0 font-medium`}
        >
          {ORDER_STATUS_LABELS[status] ?? status}
        </Badge>
      );
    },
  },
  createActionsColumn<OrderType>({
    actions: [
      ...(currentTab !== 'all'
        ? [
            {
              id: 'view',
              label: 'Просмотр',
              onClick: onView,
            },
          ]
        : []),

      ...(currentTab === 'all'
        ? [
            {
              id: 'take',
              label: 'Взять заявку',
              onClick: onTake,
            },
          ]
        : []),
      {
        id: 'delete',
        label: 'Удалить',
        onClick: onDelete,
        className: 'text-red-600',
      },
    ],
  }),
];

