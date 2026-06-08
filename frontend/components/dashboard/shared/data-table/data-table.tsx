'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { PaginationType } from '@/types/pagination';
import { PaginationCustom } from '@/components/pagination/PaginationCustom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader } from "lucide-react";
import {cn} from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  isLoading?: boolean;
  isError?: boolean;

  pagination?: PaginationType;

  className?: string;

  headerRowClassName?: string;
  rowClassName?: string | ((row: TData) => string);
  onRowClick?: (row: TData) => void;
};

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
    <>
      <div className="rounded-2xl border bg-white overflow-hidden">
        <Table className={cn('w-full', className)}>
          <TableHeader className="max-sm:hidden">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={headerRowClassName}>
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
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      'max-sm:flex max-sm:flex-col max-sm:border-b max-sm:p-4 max-sm:gap-2',
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const headerLabel =
                        typeof cell.column.columnDef.header === 'string'
                          ? cell.column.columnDef.header
                          : cell.column.id;

                      return (
                        <TableCell
                          key={cell.id}
                          data-label={headerLabel}
                          className={cn(
                            'truncate max-w-0',
                            cell.column.columnDef.meta?.className,
                            'max-sm:flex max-sm:justify-between max-sm:max-w-full max-sm:p-0',
                            'max-sm:before:content-[attr(data-label)] max-sm:before:font-medium max-sm:before:text-muted-foreground max-sm:before:shrink-0 max-sm:before:mr-4',
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
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
      </div>
      {pagination && (
        <PaginationCustom
          page={pagination.page}
          limit={pagination.limit}
          totalPage={Number(pagination.totalPages)}
          onChange={pagination.onPageChange}
        />
      )}
    </>
  );
}
