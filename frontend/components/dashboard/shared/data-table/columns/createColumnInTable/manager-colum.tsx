import type {IUser} from "@/types/user";
import type {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {Eye, Trash2} from "lucide-react";


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
  {
    header: () => (
      <div className="flex justify-end w-full pr-2">
        Действия
      </div>
    ),
    id: 'actions',
    cell: ({row}) => {
      const set = row.original;

      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(set)
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(set)
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
