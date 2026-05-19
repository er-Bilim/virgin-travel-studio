import type {IUser} from "@/types/user";
import type {ColumnDef} from "@tanstack/react-table";
import {createActionsColumn} from "@/components/dashboard/shared/data-table/columns/createActionsColumn";


export const getManagersColumns = ({
  onView,
  onDelete,
}: {
  onView: (user: IUser) => void;
  onDelete: (user: IUser) => void;
}): ColumnDef<IUser>[] => [
  {
    accessorKey: 'fullName',
    header: 'ФИО',
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
  },
  createActionsColumn<IUser>({
    actions: [
      {
        id: "view",
        label: "Просмотр",
        onClick: onView,
      },
      {
        id: "delete",
        label: "Удалить",
        onClick: onDelete,
        className: "text-red-600",
      },
    ],
  })
];
