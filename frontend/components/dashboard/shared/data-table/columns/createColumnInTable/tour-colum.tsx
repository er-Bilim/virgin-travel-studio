import type {ColumnDef} from '@tanstack/react-table';
import type {TourType} from '@/types/tour';

import {
    createActionsColumn
} from '@/components/dashboard/shared/data-table/columns/createActionsColumn';
import {Badge} from '@/components/ui/badge';
import {
    TourImageCell
} from '@/components/dashboard/shared/data-table/columnComponent/TourImageCell';
import {TooltipCustom} from '@/components/ui/tooltip-custom';
import dayjs from 'dayjs';

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
      meta: {
          className: 'max-[1150px]:hidden',
      },
    cell: ({ row }) => <TourImageCell tour={row.original} />,
  },
    {
        accessorKey: 'countryCode',
        header: 'Код страны',
        meta: {
            className: 'max-[700px]:hidden',
        },
        cell: ({ row }) => (
            <span className="font-medium text-[#1E2B6D]">
                {row.original.countryCode || '—'}
            </span>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: 'Дата создания',
        meta: {
            className: 'max-[1370px]:hidden',
        },
        cell: ({ getValue }) => {
            const rawDate = getValue<string | undefined>();

            if (!rawDate) {
                return <span>—</span>;
            }

            return (
                <>
                    <span className="hidden min-[335px]:inline">
                        {dayjs(rawDate).format('DD.MM.YYYY (HH:mm)')}
                    </span>
                    <span className="inline min-[335px]:hidden">
                        {dayjs(rawDate).format('DD.MM.YYYY')}
                    </span>
                </>
            );
        },
    },
  {
    accessorKey: 'title',
    header: 'Название',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <TooltipCustom title={row.original.title}>
          <span>{row.original.title}</span>
        </TooltipCustom>

        {!row.original.isPublished && (
          <span className="text-[10px] text-gray-400 uppercase">Черновик</span>
        )}
      </div>
    ),
  },
    {
        accessorKey: 'category',
        header: 'Категория',
        cell: ({row}) => {
            const categoryTitle = row.original.category?.title || '—';
            return (
                <div
                    className="max-w-[130px] truncate text-gray-600 font-medium"
                    title={categoryTitle}
                >
                    {categoryTitle}
                </div>
            );
        },
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
                            ? 'whitespace-nowrap bg-[#1E2B6D] text-white border-[#1E2B6D]'
                            : 'whitespace-nowrap bg-gray-100 text-gray-600 border-gray-200'
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
                    tour.isPublished
                        ? 'Снять с публикации'
                        : 'Опубликовать',

                onClick: onTogglePublish,
                className: 'text-blue-600',
            },

            {
                id: 'edit',
                label: 'Редактирование',
                onClick: onEdit,
            },

            {
                id: 'delete',
                label: 'Удалить',
                onClick: onDelete,
                className: 'text-red-600',
                hidden: () => !visible,
            },
        ],
    }),
];