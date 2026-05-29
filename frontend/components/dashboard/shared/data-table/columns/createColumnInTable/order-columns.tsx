import type {OrderType} from '@/types/order';
import type {ColumnDef} from '@tanstack/react-table';
import {
  createActionsColumn
} from '@/components/dashboard/shared/data-table/columns/createActionsColumn';

import {Badge} from '@/components/ui/badge';
import {ORDER_STATUS_LABELS, ORDER_STATUS_STYLES, type OrderStatus} from "@/lib/constants";


export const getOrdersColumns = ({
  onView,
  onDelete,
}: {
  onView: (order: OrderType) => void;
  onDelete: (order: OrderType) => void;
}): ColumnDef<OrderType>[] => [
  {
    accessorKey: '_id',
    header: 'ID',
  },
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
      <Badge className={`${ORDER_STATUS_STYLES[status]} border-0 font-medium`}>
        {ORDER_STATUS_LABELS[status] ?? status}
      </Badge>
    );
  }
  },
  createActionsColumn<OrderType>({
    actions: [
      {
        id: 'view',
        label: 'Просмотр',
        onClick: onView,
      },
      {
        id: 'delete',
        label: 'Удалить',
        onClick: onDelete,
        className: 'text-red-600',
      },
    ],
  }),
];
