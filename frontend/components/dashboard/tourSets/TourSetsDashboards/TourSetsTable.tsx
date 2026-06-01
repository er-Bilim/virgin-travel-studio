'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, X, Eye, Edit, Trash2, Loader, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useDeleteTourSet, useTourSets } from '@/lib/hooks/tourSets';
import type { TourSetType } from '@/types/tourSets';
import {
  getStatusBadge,
  getTourSetsColumns,
} from '@/components/dashboard/shared/data-table/columns/createColumnInTable/tour-sets-columns';
import { DataTable } from '@/components/dashboard/shared/data-table/data-table';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import { downloadBlobFile, isJsonBlob, parseBlobError } from '@/lib/utils';
import {
  headerRowClassName,
  rowClassName,
  tableClassName,
} from '@/lib/constants';
import { reportsTourSet } from '@/services/reports';
import type { BlobError } from '@/types/error';
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/dashboard/shared/date-range-picker/DateRangePicker';
import { PaginationCustom } from '@/components/pagination/PaginationCustom';

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

  const [windowWidth, setWindowWidth] = useState<number>(1200);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 700;

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

  const handleReport = async (id: string) => {
    try {
      const res = await reportsTourSet(id);

      downloadBlobFile({
        blob: res.data,
        disposition: res.headers?.['content-disposition'],
        filename: 'report.xlsx',
        defaultName: 'report.xlsx',
      });
    } catch (e: unknown) {
      const err = e as BlobError;

      const data = err.response?.data;

      if (data && isJsonBlob(data)) {
        const parsed = await parseBlobError(data);
        toast.error(parsed.message ?? parsed.error ?? 'Ошибка');
        return;
      }

      toast.error('Неизвестная ошибка при генерации отчёта');
    }
  };

  const columns = useMemo(() => {
    const allColumns = getTourSetsColumns({
      onReport: (set) => handleReport(set._id),
      onView: (set) =>
        router.push(`${baseToursPath}/${tourId}/groups/${set._id}`),
      onEdit: (set) =>
        router.push(`${baseToursPath}/${tourId}/groups/${set._id}/edit`),
      onDelete: (set: TourSetType) => setSetToDelete(set._id),
      canDelete: userRole === 'ADMIN' || userRole === 'MANAGER',
    });

    if (windowWidth >= 700 && windowWidth < 1300) {
      return allColumns.filter((col) => {
        const target = col as { id?: string; accessorKey?: string };
        return (
          target.id !== 'endDate' &&
          target.accessorKey !== 'endDate' &&
          target.id !== 'status' &&
          target.accessorKey !== 'status'
        );
      });
    }

    return allColumns;
  }, [userRole, baseToursPath, router, tourId, windowWidth]);

  const totalPages = Math.ceil((data?.meta.total || 0) / 5);

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm items-end">
        <div className="space-y-1.5 w-full">
          <div className="flex items-center h-5 pl-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Период потока
            </label>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </div>

        <div className="space-y-1.5 w-full">
          <div className="flex justify-between items-center h-5 px-1 text-xs gap-2">
            <span className="font-bold text-gray-500 uppercase tracking-wider truncate">
              Макс. цена
            </span>
            <span className="font-extrabold text-[#1E2B6D] bg-gray-100/80 px-2 py-0.5 rounded-md text-[11px] shrink-0">
              {maxPrice.toLocaleString()} сом
            </span>
          </div>
          <div className="bg-gray-50/50 px-4 rounded-xl border border-gray-200 h-11 flex items-center justify-center">
            <Slider
              value={[maxPrice]}
              max={500000}
              step={5000}
              onValueChange={(val: number[]) => setMaxPrice(val[0])}
              className="cursor-pointer"
            />
          </div>
        </div>

        <Button
          onClick={resetFilters}
          variant="ghost"
          className="h-11 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 border border-dashed border-gray-200 font-semibold text-xs transition-colors w-full md:col-span-2 xl:col-span-1"
        >
          <X className="w-4 h-4 mr-1.5" /> Сбросить фильтры
        </Button>
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500 shadow-sm">
              <Loader className="animate-spin w-5 h-5 mx-auto" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-sm text-red-500">
              Ошибка при загрузке данных
            </div>
          ) : !data?.tourSets.length ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
              Потоки не найдены
            </div>
          ) : (
            data.tourSets.map((set: TourSetType) => (
              <div
                key={set._id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3.5 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-900">
                      {format(new Date(set.startDate), 'dd.MM.yyyy')}
                    </span>
                    <span className="text-gray-400 text-xs">—</span>
                    <span className="text-xs font-semibold text-gray-600">
                      {format(new Date(set.endDate), 'dd.MM.yyyy')}
                    </span>
                    {set.isHot && (
                      <Badge className="bg-red-500 text-white text-[9px] px-1 py-0.5 font-bold rounded">
                        HOT
                      </Badge>
                    )}
                  </div>
                  {getStatusBadge(set.status)}
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                      Отель
                    </span>
                    <span className="font-semibold text-gray-900 text-sm leading-snug">
                      {set.hotelName}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                      Стоимость
                    </span>
                    {set.discountPrice ? (
                      <div className="flex flex-col items-end">
                        <span className="text-emerald-600 font-bold text-sm">
                          {set.discountPrice.toLocaleString()} KGS
                        </span>
                        <span className="text-[10px] line-through text-gray-400">
                          {set.price.toLocaleString()} KGS
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-900 block">
                        {set.price.toLocaleString()} KGS
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 text-gray-500 rounded-xl hover:bg-gray-50"
                    onClick={() => handleReport(set._id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 text-gray-500 rounded-xl hover:bg-gray-50"
                    onClick={() =>
                      router.push(
                        `${baseToursPath}/${tourId}/groups/${set._id}`,
                      )
                    }
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 text-gray-500 rounded-xl hover:bg-gray-50"
                    onClick={() =>
                      router.push(
                        `${baseToursPath}/${tourId}/groups/${set._id}/edit`,
                      )
                    }
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-9 h-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      onClick={() => setSetToDelete(set._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border border-gray-100 bg-white">
          <DataTable
            data={data?.tourSets || []}
            columns={columns}
            isLoading={isLoading}
            isError={isError}
            headerRowClassName={headerRowClassName}
            rowClassName={rowClassName}
            className={tableClassName}
            onRowClick={(set) =>
              router.push(`${baseToursPath}/${tourId}/groups/${set._id}`)
            }
          />
        </div>
      )}

      {data?.meta && data?.tourSets && data.tourSets.length > 0 && (
        <div className="my-8">
          <PaginationCustom
            page={page}
            limit={data.meta.limit || 5}
            totalPage={data.meta.totalPages || totalPages}
            onChange={setPage}
          />
        </div>
      )}

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
