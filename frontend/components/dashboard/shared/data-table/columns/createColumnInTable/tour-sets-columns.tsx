import type { ColumnDef } from '@tanstack/react-table';
import type { TourSetType } from '@/types/tourSets';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Props = {
    onView: (set: TourSetType) => void;
    onEdit: (set: TourSetType) => void;
    onDelete: (set: TourSetType) => void;
    canDelete: boolean;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'OPEN':
            return <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">Открыт</Badge>;

        case 'CLOSED':
            return <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Мест нет</Badge>;

        case 'FINISHED':
            return <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-100">Завершен</Badge>;

        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export const getTourSetsColumns = ({
                                       onView,
                                       onEdit,
                                       onDelete,
                                       canDelete,
                                   }: Props): ColumnDef<TourSetType>[] => [
    {
        header: 'Старт',
        accessorKey: 'startDate',
        cell: ({ row }) => {
            const set = row.original;
            return (
                <div className="flex items-center gap-2">
                    <span>{format(new Date(set.startDate), 'dd.MM.yyyy')}</span>
                    {set.isHot && (
                        <Badge className="bg-red-500 text-white text-[9px] px-1 py-0">
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
        cell: ({ row }) =>
            format(new Date(row.original.endDate), 'dd.MM.yyyy'),
    },

    {
        header: 'Отель',
        accessorKey: 'hotelName',
        cell: ({ row }) => (
            <div className="max-w-40 truncate">
                {row.original.hotelName}
            </div>
        ),
    },

    {
        header: 'Стоимость',
        accessorKey: 'price',
        cell: ({ row }) => {
            const s = row.original;

            return s.discountPrice ? (
                <div className="flex flex-col">
          <span className="text-emerald-600 font-bold">
            {s.discountPrice} KGS
          </span>
                    <span className="text-[11px] line-through text-gray-400">
            {s.price} KGS
          </span>
                </div>
            ) : (
                <span>{s.price} KGS</span>
            );
        },
    },

    {
        header: 'Статус',
        accessorKey: 'status',
        cell: ({ row }) => {
            const status = row.original.status;

            return getStatusBadge(status);
        },
    },

    {
        header: 'Действия',
        id: 'actions',
        cell: ({ row }) => {
            const set = row.original;

            return (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(set)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(set)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>

                    {canDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(set)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            );
        },
    },
];