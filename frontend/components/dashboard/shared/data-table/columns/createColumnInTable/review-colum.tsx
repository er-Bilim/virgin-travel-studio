import type {ColumnDef} from '@tanstack/react-table';
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
import {TooltipCustom} from '@/components/ui/tooltip-custom';
import type {IReview} from "@/types/review";
import dayjs from "dayjs";

type Props = {
  onView: (tour: IReview) => void;
  onDelete: (tour: IReview) => void;
  onTogglePublish: (tour: IReview) => void;
};

export const getReviewColumns = ({
                                 onView,
                                 onDelete,
                                 onTogglePublish,
                               }: Props): ColumnDef<IReview>[] => [
  {
    accessorKey: 'tour',
    header: 'Отзыв тура',
    cell: ({row}) => {
      const review = row.original;
      const tour = review.tourId;

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm"
              >
                Посмотреть тур
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-xl flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Информация о туре</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                {tour?.images && tour.images.length > 0 && (
                  <div className="relative w-full h-48 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={`${imageUrl}/${tour.images[0]}`}
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-lg text-gray-950">{tour?.title}</h3>
                    {tour?.countryCode && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium uppercase">
            {tour.countryCode}
          </span>
                    )}
                  </div>

                  {tour?.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-4">
                      {tour.description}
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
  {
    accessorKey: 'clientName',
    header: 'Имя клиента',
    cell: ({row}) => {
      const author = row.original.clientName;
      return (
        <span className="font-medium text-gray-900">
          {author || 'Аноним'}
        </span>
      );
    },
  },
  {
    accessorKey: 'comment',
    header: 'Текст отзыва',
    cell: ({row}) => {
      const text = row.original.comment;
      return (
        <div className="max-w-[300px]">
          <TooltipCustom title={text}>
            <span className="text-sm text-gray-600 line-clamp-2">
              {text}
            </span>
          </TooltipCustom>
        </div>
      );
    },
  },
  {
    accessorKey: 'rating',
    header: 'Рейтинг',
    cell: ({row}) => {
      const rating = row.original.rating;
      return (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-sm font-semibold">{rating}</span>
        </div>
      );
    },
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
    accessorKey: 'isModerated',
    header: 'Статус',
    cell: ({row}) => {
      const isModerated = row.original.isModerated;

      let badgeStyles = "bg-gray-100 text-gray-600 border-gray-200";
      let statusLabel = "Ожидает";

      if (isModerated === "approved") {
        badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
        statusLabel = "Опубликовано";
      } else if (isModerated === "rejected") {
        badgeStyles = "bg-rose-50 text-rose-700 border-rose-200";
        statusLabel = "Отклонено";
      }

      return (
        <Badge variant="outline" className={badgeStyles}>
          {statusLabel}
        </Badge>
      );
    },
  },
  createActionsColumn<IReview>({
    actions: [
      {
        id: 'view',
        label: 'Просмотр',
        onClick: onView,
      },
      {
        id: 'toggle-publish',
        label: (review) =>
          review.isModerated === 'approved' ? 'Снять с публикации' : 'Опубликовать',
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
