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
    actions: TableAction<T>[];
};

export function createActionsColumn<T>({
                                           actions,
                                       }: ActionsProps<T>): ColumnDef<T> {
    return {
        id: "actions",
        size: 50,
        minSize: 50,
        maxSize: 50,

        header: () => (
            <div className="text-right w-full pr-2">
                Действия
            </div>
        ),
        cell: ({ row }) => {
            const data = row.original;

            return (
                <div className="flex justify-end w-full pr-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {actions.filter((action) => {
                            if (typeof action.hidden === 'function') {
                                return !action.hidden(data);
                            }

                            return !action.hidden;
                        }).map((action) => {
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
            );
        },
    };
}