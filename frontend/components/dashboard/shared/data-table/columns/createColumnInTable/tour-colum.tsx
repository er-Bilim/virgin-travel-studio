import type { ColumnDef } from '@tanstack/react-table';
import type { TourType } from '@/types/tour';
import { createActionsColumn } from '@/components/dashboard/shared/data-table/columns/createActionsColumn';
import {imageUrl} from "@/lib/constants";
import {Badge} from "@/components/ui/badge";

type Props = {
    onView: (tour: TourType) => void;
    onDelete: (tour: TourType) => void;
    onTogglePublish: (tour: TourType) => void;
    onEdit: (tour: TourType) => void;
    visible: boolean;
};

export const getToursColumns = ({
                                    onView,
                                    onDelete,
                                    onTogglePublish,
                                    onEdit,
                                    visible,
                                }: Props): ColumnDef<TourType>[] => [
    {
        id: 'image',
        size: 70,
        header: 'Фото',
        cell: ({ row }) => {
            const tour = row.original;

            if (!tour.images?.[0]) {
                return (
                    <div className="w-10 h-10 rounded bg-gray-200" />
                );
            }

            return (
                <img
                    alt="Фото туров"
                    src={imageUrl + tour.images[0]}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                />
            );
        },
    },
    {
        accessorKey: 'title',
        header: 'Название',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <div className="w-ful max-w-60 truncate">
                    {row.original.title}
                </div>

                {!row.original.isPublished && (
                    <span className="text-[10px] text-gray-400 uppercase">
                    Черновик
                </span>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'category',
        header: 'Категория',
        cell: ({ row }) => row.original.category?.title || '—',
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

    createActionsColumn<TourType>({
        actions: [
            {
                id: 'view',
                label: 'Просмотр',
                onClick: onView,
            },
            {
                id: 'toggle-publish',
                label: (tour) =>
                    tour.isPublished ? 'Снять с публикации' : 'Опубликовать',

                onClick: onTogglePublish,
                className: 'text-blue-600',
            },
            {
               id: 'edit',
               label: 'Редактироание',
               onClick: onEdit,
            },
            {
                id: 'delete',
                label: 'Удалить',
                onClick: onDelete,
                className: 'text-red-600',
                hidden: () => !visible
            },
        ],
    }),
];
