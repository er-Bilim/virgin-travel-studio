import type { OrderType } from "@/types/order";
import type {ColumnDef} from "@tanstack/react-table";
import {createActionsColumn} from "@/components/dashboard/shared/data-table/columns/createActionsColumn";


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
