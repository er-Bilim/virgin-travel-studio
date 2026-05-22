import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { createActionsColumn } from '@/components/dashboard/shared/data-table/columns/createActionsColumn';
import type {TourCategoryType} from "@/types/tour";





type Props = {
    onDelete: (category: TourCategoryType) => void;
    onTogglePublish: (category: TourCategoryType) => void;
};

export const getCategoryColumns = ({
                                       onDelete,
                                       onTogglePublish,
                                   }: Props): ColumnDef<TourCategoryType>[] => [
    {
        accessorKey: 'title',
        header: 'Название категории',
        cell: ({ row }) => (
            <div className="flex flex-col">
        <span className="font-medium text-gray-900">
          {row.original.title}
        </span>

                {!row.original.isPublished && (
                    <span className="text-[10px] text-[#C8D2DC] font-bold uppercase tracking-wider">
            Скрыта
          </span>
                )}
            </div>
        ),
    },

    {
        accessorKey: 'status',
        header: 'Статус',
        cell: ({ row }) => {
            const isPublished = row.original.isPublished;

            return (
                <Badge
                    variant="outline"
                    className={
                        isPublished
                            ? "bg-[#1E2B6D] text-white border-[#1E2B6D]"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                    }
                >
                    {isPublished ? 'Опубликовано' : 'Не опубликовано'}
                </Badge>
            );
        },
    },

    createActionsColumn<TourCategoryType>({
        actions: [
            {
                id: 'toggle-publish',
                label: (category) =>
                    category.isPublished
                        ? 'Снять с публикации'
                        : 'Опубликовать',

                onClick: onTogglePublish,
                className: 'text-blue-600',
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