'use client';

import { useDeleteManager, useManagers } from '@/lib/hooks/managerHook';
import { useRouter } from 'next/navigation';
import { CreateManagerForm } from '@/components/dashboard/managers/CreateManagerForm';
import { DataTable } from '@/components/dashboard/shared/data-table/data-table';
import {ConfirmDialog} from "@/components/dashboard/ConfirmDialog/ConfirmDialog";
import {getManagersColumns} from "@/components/dashboard/shared/data-table/columns/createColumnInTable/manager-colum";
import { useMemo, useState} from "react";
import {headerRowClassName, rowClassName, tableClassName} from "@/lib/constants";

export default function ManagersPage() {
    const router = useRouter();
    const [managerToDelete, setManagerToDelete] = useState<string | null>(null);
    const { data = [], isLoading, isError } = useManagers();
    const { mutate: deleteManager, isPending: isDeleting  } = useDeleteManager();

    const columns = useMemo(
        () => getManagersColumns({
            onView: (user) => router.push(`/admin/managers/${user._id}`),
            onDelete: (user) => {
                setManagerToDelete(user._id);
                },
        }),
        [router]
    );

    const confirmDelete = () => {
        if (!managerToDelete) return;

        deleteManager(managerToDelete, {
            onSettled: () => setManagerToDelete(null),
        });
    };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Менеджеры</h1>

      <CreateManagerForm />

      <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          isError={isError}
          headerRowClassName={headerRowClassName}
          rowClassName={rowClassName}
          className={tableClassName}
      />

        <ConfirmDialog
            open={!!managerToDelete}
            title="Удалить менеджера?"
            description="Это действие нельзя отменить"
            loading={isDeleting}
            confirmText="Удалить"
            onCancel={() => setManagerToDelete(null)}
            onConfirm={confirmDelete}
        />
    </div>
  );
}
