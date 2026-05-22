'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useDeleteTourSet, useTourSets } from '@/lib/hooks/tourSets';
import type { TourSetType } from '@/types/tourSets';
import { getTourSetsColumns } from '@/components/dashboard/shared/data-table/columns/createColumnInTable/tour-sets-columns';
import { DataTable } from '@/components/dashboard/shared/data-table/data-table';
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
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
        onView: (set) =>
          router.push(`${baseToursPath}/${tourId}/groups/${set._id}`),
        onEdit: (set) =>
          router.push(`${baseToursPath}/${tourId}/groups/${set._id}/edit`),
        onDelete: (set: TourSetType) => setSetToDelete(set._id),
        canDelete: userRole === 'ADMIN' || userRole === 'MANAGER',
      }),
    [userRole, baseToursPath, router, tourId],
  );

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
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