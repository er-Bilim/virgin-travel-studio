'use client';

import { useDeleteManager, useManagers } from '@/lib/hooks/managerHook';
import { CreateManagerForm } from '@/components/dashboard/managers/CreateManagerForm';
import { DataTable } from '@/components/dashboard/shared/data-table/data-table';
import {ConfirmDialog} from "@/components/dashboard/ConfirmDialog/ConfirmDialog";
import { useMemo, useState} from "react";
import {headerRowClassName, rowClassName, tableClassName} from "@/lib/constants";
import {Button} from "@/components/ui/button";
import {Modal} from "@/components/shared/Modal";
import {useModalStore} from "@/lib/stores/modalStore";
import {Plus} from "lucide-react";
import {getManagersColumns} from "@/components/dashboard/shared/data-table/columns/createColumnInTable/manager-colum";

export default function ManagersPage() {
    const [managerToDelete, setManagerToDelete] = useState<string | null>(null);
    const { data = [], isLoading, isError } = useManagers();
    const { mutate: deleteManager, isPending: isDeleting  } = useDeleteManager();
    const { openModal } = useModalStore();

    const columns = useMemo(
        () => getManagersColumns({
            onDelete: (user) => {
                setManagerToDelete(user._id);
                },
        }),
        []
    );

    const confirmDelete = () => {
        if (!managerToDelete) return;

        deleteManager(managerToDelete, {
            onSettled: () => setManagerToDelete(null),
        });
    };

  return (
    <div className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap">
            <h1 className="text-2xl font-bold">Менеджеры</h1>
            <Button
                className="bg-[#1E2B6D] hover:bg-[#162356]"
                onClick={() => openModal("createManager")}
            >
                <Plus className="w-4 h-4 mr-2" /> Создать менеджера
            </Button>
        </div>

        <Modal id="createManager" title="Создание менеджера">
            <CreateManagerForm />
        </Modal>

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
