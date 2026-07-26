import type { ColumnDef } from '@tanstack/react-table';
import type { TourSetType } from '@/types/tourSets';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { createActionsColumn } from '@/components/dashboard/shared/data-table/columns/createActionsColumn';
import { TooltipCustom } from '@/components/ui/tooltip-custom';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'OPEN':
      return (
        <Badge
          variant="outline"
          className="text-emerald-700 border-emerald-200 bg-emerald-50 whitespace-nowrap"
        >
          Открыт
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge
          variant="outline"
          className="text-amber-700 border-amber-200 bg-amber-50 whitespace-nowrap"
        >
          Мест нет
        </Badge>
      );
    case 'FINISHED':
      return (
        <Badge
          variant="outline"
          className="text-gray-600 border-gray-200 bg-gray-100 whitespace-nowrap"
        >
          Завершен
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {status}
        </Badge>
      );
  }
};

type Props = {
  onReport: (set: TourSetType) => void;
  onView: (set: TourSetType) => void;
  onEdit: (set: TourSetType) => void;
  onDelete: (set: TourSetType) => void;
  canDelete: boolean;
};

export const getTourSetsColumns = ({
  onView,
  onEdit,
  onDelete,
  canDelete,
  onReport,
}: Props): ColumnDef<TourSetType>[] => [
  {
    header: 'Старт',
    accessorKey: 'startDate',
    cell: ({ row }) => {
      const set = row.original;
      return (
        <div className="flex items-center gap-1.5 min-w-[95px] whitespace-nowrap">
          <span className="font-medium text-gray-900">
            {format(new Date(set.startDate), 'dd.MM.yyyy')}
          </span>
          {set.isHot && (
            <Badge className="bg-red-500 text-white text-[9px] px-1 py-0.5 leading-none font-bold rounded shrink-0">
              HOT
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    header: 'Конец',
    accessorKey: 'endDate',
    cell: ({ row }) => (
      <div className="min-w-[85px] whitespace-nowrap text-gray-600">
        {format(new Date(row.original.endDate), 'dd.MM.yyyy')}
      </div>
    ),
  },
  {
    header: 'Отель',
    accessorKey: 'hotelName',
    cell: ({ row }) => {
      const name = row.original.hotelName;
      return (
        <TooltipCustom title={name}>
          <span>{name}</span>
        </TooltipCustom>
      );
    },
  },
  {
    header: 'Стоимость',
    accessorKey: 'price',
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex flex-col min-w-[90px] whitespace-nowrap">
          {s.discountPrice ? (
            <>
              <span className="text-emerald-600 font-bold text-xs md:text-sm">
                {s.discountPrice.toLocaleString()} KGS
              </span>
              <span className="text-[10px] line-through text-gray-400">
                {s.price.toLocaleString()} KGS
              </span>
            </>
          ) : (
            <span className="text-xs md:text-sm font-medium text-gray-900">
              {s.price.toLocaleString()} KGS
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: 'Статус',
    accessorKey: 'status',
    cell: ({ row }) => (
      <div className="min-w-[90px]">{getStatusBadge(row.original.status)}</div>
    ),
  },
  createActionsColumn<TourSetType>({
    actions: [
      { id: 'report', label: 'Отчет по потоку тура', onClick: onReport },
      { id: 'view', label: 'Просмотреть', onClick: onView },
      { id: 'edit', label: 'Редактировать', onClick: onEdit },
      {
        id: 'delete',
        label: 'Удалить',
        onClick: onDelete,
        className: 'text-red-600 focus:text-red-600 focus:bg-red-50',
        hidden: !canDelete,
      },
    ],
  }),
];
