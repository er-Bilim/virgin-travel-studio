'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar as CalendarIcon, X, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDeleteTourSet, useTourSets } from '@/lib/hooks/tourSets';
import type { TourSetType } from '@/types/tourSets';
import { getTourSetsColumns } from '@/components/dashboard/shared/data-table/columns/createColumnInTable/tour-sets-columns';
import { DataTable } from '@/components/dashboard/shared/data-table/data-table';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import { cn } from '@/lib/utils';
import {
  headerRowClassName,
  rowClassName,
  tableClassName,
} from '@/lib/constants';

interface Props {
  tourId: string;
  baseToursPath: string;
  userRole?: string;
}

export default function TourSetsTable({
  tourId,
  baseToursPath,
  userRole,
}: Props) {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);

  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [debouncedPrice, setDebouncedPrice] = useState<number>(500000);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrice(maxPrice);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [maxPrice]);

  const { data, isLoading, isError } = useTourSets({
    page,
    limit: 5,
    tourId,
    maxPrice: debouncedPrice || undefined,
    startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
  });

  const { mutate: deleteTourSet, isPending: isDeleting } = useDeleteTourSet();

  const confirmDelete = () => {
    if (setToDelete) {
      deleteTourSet(setToDelete, {
        onSuccess: () => setSetToDelete(null),
      });
    }
  };

  const resetFilters = () => {
    setMaxPrice(500000);
    setDebouncedPrice(500000);
    setDateRange(undefined);
    setPage(1);
  };

  const baseColumns = useMemo(
    () =>
      getTourSetsColumns({
        onView: (set) =>
          router.push(`${baseToursPath}/${tourId}/groups/${set._id}`),
        onEdit: (set) =>
          router.push(`${baseToursPath}/${tourId}/groups/${set._id}/edit`),
        onDelete: (set: TourSetType) => setSetToDelete(set._id),
        canDelete: userRole === 'ADMIN' || userRole === 'MANAGER',
      }),
    [userRole, baseToursPath, router, tourId],
  );

  const columns = useMemo(() => {
    return baseColumns.map((col) => {
      if ('accessorKey' in col && col.accessorKey === 'hotelName') {
        return {
          ...col,
          cell: ({ row }: { row: { original: TourSetType } }) => {
            const name = row.original.hotelName;
            const isLong = name.length > 20;
            const truncatedName = isLong ? `${name.slice(0, 20)}...` : name;

            return (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        'font-medium text-gray-900 pb-0.5',
                        isLong &&
                          'cursor-help border-b border-dotted border-gray-400',
                      )}
                    >
                      {truncatedName}
                    </span>
                  </TooltipTrigger>
                  {isLong && (
                    <TooltipContent
                      side="top"
                      className="bg-[#1E2B6D] text-white max-w-xs rounded-xl p-3 shadow-md border-none"
                    >
                      <div className="flex gap-2 items-start">
                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" />
                        <p className="text-xs font-medium leading-relaxed">
                          {name}
                        </p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          },
        };
      }
      return col;
    });
  }, [baseColumns]);

  return (
    <div className="space-y-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#1E2B6D]">Потоки тура</h3>

        <Button
          asChild
          size="sm"
          className="bg-[#1E2B6D] hover:bg-[#162356] rounded-xl h-9 text-xs font-semibold shadow-sm"
        >
          <Link href={`${baseToursPath}/${tourId}/groups/new`}>
            <Plus className="w-4 h-4 mr-1.5" />
            Добавить поток
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm items-end">
        <div className="space-y-1.5">
          <div className="flex items-center h-5 pl-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Период потока
            </label>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal bg-gray-50/50 rounded-xl border-gray-200 h-11 px-3 focus:ring-2 focus:ring-[#1E2B6D]',
                  !dateRange && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd.MM.yyyy', { locale: ru })} –{' '}
                      {format(dateRange.to, 'dd.MM.yyyy', { locale: ru })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd.MM.yyyy', { locale: ru })
                  )
                ) : (
                  <span>Выберите диапазон дат</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 rounded-2xl shadow-lg border-gray-100"
              align="start"
            >
              <Calendar
                autoFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center h-5 px-1 text-xs">
            <span className="font-bold text-gray-500 uppercase tracking-wider">
              Макс. цена
            </span>
            <span className="font-extrabold text-[#1E2B6D] bg-gray-100/80 px-2 py-0.5 rounded-md text-[11px] leading-none">
              {maxPrice.toLocaleString()} сом
            </span>
          </div>
          <div className="bg-gray-50/50 px-4 rounded-xl border border-gray-200 h-11 flex items-center justify-center">
            <Slider
              value={[maxPrice]}
              max={500000}
              step={5000}
              onValueChange={(val: number[]) => {
                setMaxPrice(val[0]);
              }}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Кнопка сброса */}
        <Button
          onClick={resetFilters}
          variant="ghost"
          className="h-11 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 border border-dashed border-gray-200 font-semibold text-xs transition-colors w-full"
        >
          <X className="w-4 h-4 mr-1.5" /> Сбросить фильтры
        </Button>
      </div>

      <DataTable
        data={data?.tourSets || []}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        pagination={{
          page,
          pageSize: 5,
          total: data?.meta.total || 0,
          onPageChange: setPage,
        }}
        headerRowClassName={headerRowClassName}
        rowClassName={rowClassName}
        className={tableClassName}
      />

      <ConfirmDialog
        open={!!setToDelete}
        title="Вы уверены, что хотите удалить поток?"
        description="Это действие нельзя отменить"
        loading={isDeleting}
        confirmText="Удалить"
        onCancel={() => setSetToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
