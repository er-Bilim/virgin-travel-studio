import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Globe,
  SquarePlay,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TableAction } from '@/types/helpersComponent';

type ActionsProps<T> = {
  meta?: ColumnDef<T, unknown>['meta'];
  actions: TableAction<T>[];
};

const getActionIcon = (id: string, label: string) => {
  const lowerId = id?.toLowerCase() || '';
  const lowerLabel = label?.toLowerCase() || '';

  if (
    lowerId.includes('view') ||
    lowerLabel.includes('просмотр') ||
    lowerLabel.includes('посмотреть')
  ) {
    return <Eye className="h-4 w-4" />;
  }
  if (
    lowerId.includes('edit') ||
    lowerId.includes('update') ||
    lowerLabel.includes('редакт')
  ) {
    return <Pencil className="h-4 w-4" />;
  }
  if (
    lowerId.includes('delete') ||
    lowerId.includes('remove') ||
    lowerLabel.includes('удал')
  ) {
    return <Trash2 className="h-4 w-4" />;
  }
  if (lowerId.includes('publish') || lowerLabel.includes('публик')) {
    return <Globe className="h-4 w-4" />;
  }

  return <SquarePlay className="h-4 w-4" />;
};

export function createActionsColumn<T>({
  meta,
  actions,
}: ActionsProps<T>): ColumnDef<T> {
  return {
    id: 'Действия',
    size: 50,
    meta,
    minSize: 50,
    maxSize: 50,

    header: () => <div className="text-right w-full pr-2">Действия</div>,
    cell: ({ row }) => {
      const data = row.original;

      const visibleActions = actions.filter((action) => {
        if (typeof action.hidden === 'function') {
          return !action.hidden(data);
        }
        return !action.hidden;
      });

      return (
        <div className="w-full" onClick={(e) => e.stopPropagation()}>
          <div className="hidden sm:flex justify-end w-full pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {visibleActions.map((action) => {
                  const label =
                    typeof action.label === 'function'
                      ? action.label(data)
                      : action.label;

                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => action.onClick(data)}
                      className={action.className}
                    >
                      {label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2 justify-end w-full sm:hidden">
            {visibleActions.map((action) => {
              const label =
                typeof action.label === 'function'
                  ? action.label(data)
                  : action.label;

              return (
                <Button
                  key={action.id}
                  size="icon"
                  variant={action.id === 'delete' ? 'destructive' : 'outline'}
                  className={`h-9 w-9 p-0 ${action.className ?? ''}`}
                  onClick={() => action.onClick(data)}
                  title={label}
                  aria-label={label}
                >
                  {getActionIcon(action.id, label)}
                </Button>
              );
            })}
          </div>
        </div>
      );
    },
  };
}
