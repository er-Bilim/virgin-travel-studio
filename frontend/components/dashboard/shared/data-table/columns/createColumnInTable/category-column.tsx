import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TourCategoryType } from '@/types/tour';

type Props = {
  onDelete: (category: TourCategoryType) => void;
};

export const getCategoryColumns = ({
  onDelete,
}: Props): ColumnDef<TourCategoryType>[] => [
  {
    accessorKey: 'title',
    header: 'Название категории',
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.original.title}</span>
    ),
  },

  {
    id: 'actions',
    size: 50,
    header: () => <div className="text-right w-full pr-2">Действия</div>,
    cell: ({ row }) => (
      <div
        className="flex justify-end pr-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(row.original)}
          aria-label="Удалить категорию"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
