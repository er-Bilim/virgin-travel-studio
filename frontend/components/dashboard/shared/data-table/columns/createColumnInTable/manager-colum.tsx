import type {IUser} from '@/types/user';
import type {ColumnDef} from '@tanstack/react-table';
import {Button} from '@/components/ui/button';
import {Eye, Lock, LockOpen} from 'lucide-react';
import type { UserStatus} from '@/lib/constants';
import {
  USER_STATUS_COLORS,
  USER_STATUS_LABELS
} from '@/lib/constants';

import {Badge} from '@/components/ui/badge';


export const getManagersColumns = ({
  onView,
  onBanned,
}: {
  onView: (user: IUser) => void;
  onBanned: (user: IUser) => void;
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
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.original.status as UserStatus;
      return (
        <Badge className={`${USER_STATUS_COLORS[status]} border-0 font-medium`}>
          {USER_STATUS_LABELS[status] ?? status}
        </Badge>
      );
    },
  },
  {
    header: () => <div className="flex justify-end w-full pr-2">Действия</div>,
    id: 'actions',
    cell: ({ row }) => {
      const set = row.original;

      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(set);
            }}
            aria-label="Посмотреть профиль"

          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant={set.status === 'banned' ? 'outline' : 'destructive'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBanned(set);
            }}
            aria-label={set.status === 'banned' ? "Разблокировать пользователя" : "Заблокировать пользователя"}
          >
            {set.status === 'banned' ? (
              <LockOpen className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </Button>
        </div>
      );
    },
  },
];
