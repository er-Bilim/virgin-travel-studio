import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {TableAction} from "@/types/helpersComponent";

type ActionsProps<T> = {
  meta?: ColumnDef<T, unknown>['meta'];
  actions: TableAction<T>[];
};

export function createActionsColumn<T>({
                                           meta,
                                           actions,
                                       }: ActionsProps<T>): ColumnDef<T> {
    return {
      id: 'actions',
      size: 50,
      meta,
      minSize: 50,
      maxSize: 50,

      header: () => <div className="text-right w-full pr-2">Действия</div>,
      cell: ({ row }) => {
        const data = row.original;

        // Сначала фильтруем только видимые экшены 
        const visibleActions = actions.filter((action) => {
          if (typeof action.hidden === 'function') {
            return !action.hidden(data);
          }
          return !action.hidden;
        });

        return (
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
            {/* 1. ВАРИАНТ ДЛЯ ДЕСКТОПА: Виден только на экранах md и выше (md:flex) */}
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

            {/* 2. ВАРИАНТ ДЛЯ МОБИЛЬНЫХ: Скрыт на ПК (md:hidden), кнопки отображаются плиткой */}
            <div className="flex flex-wrap gap-2 justify-end w-full sm:hidden">
              {visibleActions.map((action) => {
                const label =
                  typeof action.label === 'function'
                    ? action.label(data)
                    : action.label;

                return (
                  <Button
                    key={action.id}
                    size="sm"
                    variant={action.id === 'delete' ? 'destructive' : 'outline'}
                    className={`h-8 text-xs ${action.className ?? ''}`}
                    onClick={() => action.onClick(data)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      },
    };
}