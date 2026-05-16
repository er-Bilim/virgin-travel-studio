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

type ActionsProps<T> = {
    onView?: (row: T) => void;
    onDelete?: (row: T) => void;
};

export function createActionsColumn<T>({
                                           onView,
                                           onDelete,
                                       }: ActionsProps<T>): ColumnDef<T> {
    return {
        id: "actions",
        cell: ({ row }) => {
            const data = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {onView && (
                            <DropdownMenuItem onClick={() => onView(data)}>
                                Детальный просмотр
                            </DropdownMenuItem>
                        )}

                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(data)}
                                className="text-red-600"
                            >
                                Удалить
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    };
}