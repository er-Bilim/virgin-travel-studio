'use client';

import type {ColumnDef} from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {ChevronLeft, ChevronRight, Loader} from 'lucide-react';
import {cn} from '@/lib/utils';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  isLoading?: boolean;
  isError?: boolean;

  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };

    className?: string;

    headerRowClassName?: string;
    rowClassName?: string | ((row: TData) => string);
    onRowClick?: (row: TData) => void;
};

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             isLoading,
                                             isError,
                                             pagination,
                                             className,
                                             headerRowClassName,
                                             rowClassName,
                                             onRowClick
}: DataTableProps<TData, TValue>) {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pageSize)) : 1;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    manualPagination: true,

    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },

    pageCount: totalPages,
  });

  if (isLoading) {
    return (
        <div className="rounded-2xl border bg-white">
          <div className="p-8 text-center text-gray-500">
            <Loader className="animate-spin w-5 h-5 mx-auto" />
          </div>
        </div>
    );
  }

  if (isError) {
    return (
        <div className="rounded-2xl border bg-white overflow-hidden">
            <Table className={cn("w-full table-fixed", className)}>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={columns.length}>
                            <div className="p-6 text-center text-gray-500">Нет данных</div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <Table className={cn("w-full table-fixed", className)}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
                key={headerGroup.id}
                className={headerRowClassName}
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                    key={header.id}
                    className={cn(header.column.columnDef.meta?.className)}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
            {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                    const rowClass =
                        typeof rowClassName === 'function'
                            ? rowClassName(row.original)
                            : rowClassName;

                    return (
                        <TableRow
                            key={row.id}
                            className={cn(
                                rowClass,
                                onRowClick && "cursor-pointer hover:bg-muted/50"
                            )}
                            onClick={() => onRowClick?.(row.original)}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    className={cn(cell.column.columnDef.meta?.className)}
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    );
                })
            ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>Нет данных</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              Страница <span>{page}</span> из{" "}
              <span>{totalPages}</span>
            </div>

            <div className="flex gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() =>
                      pagination.onPageChange(page - 1)
                  }
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>

              <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() =>
                      pagination.onPageChange(page + 1)
                  }
              >
                Вперед
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
      )}
    </div>
  );
}
