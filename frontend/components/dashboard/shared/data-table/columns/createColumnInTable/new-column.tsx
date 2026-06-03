import type {NewsFields} from '@/types/news';
import type {ColumnDef} from '@tanstack/react-table';
import {format} from 'date-fns';
import {Badge} from '@/components/ui/badge';
import {
  createActionsColumn
} from '@/components/dashboard/shared/data-table/columns/createActionsColumn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {imageUrl} from '@/lib/constants';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

type Props = {
  onView: (tour: NewsFields) => void;
  onDelete: (tour: NewsFields) => void;
  onTogglePublish: (tour: NewsFields) => void;
  onEdit: (tour: NewsFields) => void;
};

export const getNewsColumns = ({
                                 onView,
                                 onDelete,
                                 onTogglePublish,
                                 onEdit,
                               }: Props): ColumnDef<NewsFields>[] => [
  {
    accessorKey: 'image',
    header: 'Фото',
    cell: ({row}) => {
      const news = row.original;

      if (!news.image) {
        return (
          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-400">
            Нет фото
          </div>
        );
      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm"
            >
              Посмотреть
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl flex flex-col items-center">
            <DialogHeader>
              <DialogTitle className="sr-only">
                Просмотр изображения
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-center">
              <img
                  src={imageUrl + news.image}
                  alt={news.title}
                  className="max-h-[80vh] w-auto rounded-xl object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: 'title',
    header: 'Название',
    cell: ({row}) => (
      <div className="flex flex-col">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="w-full max-w-60 truncate cursor-help hover:text-gray-900 transition-colors">
                {row.original.title}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-slate-900 text-white border-none rounded-md p-2 shadow-md">
              <p className="text-xs break-words leading-relaxed">{row.original.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!row.original.isPublished && (
          <span className="text-[10px] text-gray-400 uppercase">
                    Черновик
                </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'author',
    header: 'Автор',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({row}) => row.original.author.fullName,
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({row}) => format(new Date(row.original.createdAt), 'dd.MM.yyyy'),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({row}) => {
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
  createActionsColumn<NewsFields>({
    actions: [
      {
        id: 'view',
        label: 'Просмотр',
        onClick: onView,
      },
      {
        id: 'toggle-publish',
        label: (news) =>
          news.isPublished ? 'Снять с публикации' : 'Опубликовать',

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
      },
    ],
  }),
]