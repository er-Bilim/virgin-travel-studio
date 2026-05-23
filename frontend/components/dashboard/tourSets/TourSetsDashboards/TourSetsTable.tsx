'use client';

import {useMemo, useState} from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TourSetType } from '@/types/tourSets';
import { useDeleteTourSet, useTourSets } from '@/lib/hooks/tourSets';
import {
  getTourSetsColumns
} from "@/components/dashboard/shared/data-table/columns/createColumnInTable/tour-sets-columns";
import {useRouter} from "next/navigation";
import {DataTable} from "@/components/dashboard/shared/data-table/data-table";
import {ConfirmDialog} from "@/components/dashboard/ConfirmDialog/ConfirmDialog";
import {headerRowClassName, rowClassName, tableClassName} from "@/lib/constants";

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
  const [selectedSet, setSelectedSet] = useState<TourSetType | null>(null);

  const { data, isLoading, isError } = useTourSets(page, 5, tourId);
  const { mutate: deleteTourSet, isPending: isDeleting } = useDeleteTourSet();

  const confirmDelete = () => {
    if (setToDelete) {
      deleteTourSet(setToDelete, {
        onSuccess: () => setSetToDelete(null),
      });
    }
  };

  const columns = useMemo(
      () =>
          getTourSetsColumns({
            onView: setSelectedSet,
            onEdit: (set) =>
                router.push(`${baseToursPath}/${tourId}/groups/${set._id}/edit`),
            onDelete: (set: TourSetType) => setSetToDelete(set._id),
            canDelete: userRole === 'ADMIN' || userRole === 'MANAGER',
          }),
      [userRole, baseToursPath, router, tourId]
  );

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#1E2B6D]">Потоки тура</h3>
        <Button
          asChild
          size="sm"
          className="bg-[`#1E2B6D`] hover:bg-[`#162356`] rounded-xl h-9 text-xs font-semibold shadow-sm"
        >
          <Link href={`${baseToursPath}/${tourId}/groups/new`}>
            <Plus className="w-4 h-4 mr-1.5" /> Добавить поток
          </Link>
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

      <Dialog open={!!selectedSet} onOpenChange={() => setSelectedSet(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#1E2B6D]">
              Детальная информация о потоке
            </DialogTitle>
          </DialogHeader>
          {selectedSet && (
            <div className="space-y-3 pt-2 text-sm text-gray-700">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Период потока:</span>
                <span className="font-medium">
                  {format(new Date(selectedSet.startDate), 'dd MMMM yyyy', {
                    locale: ru,
                  })}{' '}
                  —{' '}
                  {format(new Date(selectedSet.endDate), 'dd MMMM yyyy', {
                    locale: ru,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Отель и локация:</span>
                <span className="font-medium">
                  {selectedSet.hotelName} ({selectedSet.hotelLocation})
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Авиакомпания:</span>
                <span className="font-medium">
                  {selectedSet.airline || '—'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Детали рейса:</span>
                <span className="font-medium">
                  {selectedSet.flightDetails || '—'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Свободные места:</span>
                <span className="font-medium">
                  {selectedSet.totalSeats - (selectedSet.bookedSeats || 0)} из{' '}
                  {selectedSet.totalSeats}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-gray-400">Базовая стоимость:</span>
                <span className="font-bold text-[#1E2B6D]">
                  {selectedSet.price} KGS
                </span>
              </div>
              {selectedSet.discountPrice && (
                <div className="flex justify-between border-b pb-1.5 text-emerald-600">
                  <span className="font-semibold">Цена по акции:</span>
                  <span className="font-bold">
                    {selectedSet.discountPrice} KGS
                  </span>
                </div>
              )}
              {selectedSet.saleDeadline && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold block uppercase tracking-wider text-[10px]">
                      Дедлайн акции:
                    </span>
                    {format(new Date(selectedSet.saleDeadline), 'PP в HH:mm', {
                      locale: ru,
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
          open={!!setToDelete}
          title="Вы уверенны что хотите удалить поток?"
          description="Это действие нельзя отменить"
          loading={isDeleting}
          confirmText="Удалить"
          onCancel={() => setSetToDelete(null)}
          onConfirm={confirmDelete}
      />
    </div>
  );
}
