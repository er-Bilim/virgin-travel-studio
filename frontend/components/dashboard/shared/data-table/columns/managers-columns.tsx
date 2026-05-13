import type {IUser} from "@/types/user";
import type {ColumnDef} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal} from "lucide-react";


export const getManagersColumns = ({
                                       onView,
                                       onDelete,
                                   }: {
    onView: (user: IUser) => void;
    onDelete: (user: IUser) => void;
}): ColumnDef<IUser>[] => [
    {
        accessorKey: "fullName",
        header: "ФИО",
    },
    {
        accessorKey: "phone",
        header: "Телефон",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;

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

                        <DropdownMenuItem onClick={() => onView(user)}>
                            Детальный просмотр
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => onDelete(user)}
                            className="text-red-600"
                        >
                            Удалить
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }
];