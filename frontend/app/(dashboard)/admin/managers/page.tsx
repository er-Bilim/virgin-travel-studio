'use client';

import {useDeleteManager, useManagers} from '@/lib/hooks/managerHook';
import {CreateManagerForm} from '@/components/dashboard/managers/CreateManagerForm';
import {DataTable} from '@/components/dashboard/shared/data-table/data-table';
import {ConfirmDialog} from "@/components/dashboard/ConfirmDialog/ConfirmDialog";
import {useMemo, useState} from "react";
import {headerRowClassName, rowClassName, tableClassName} from "@/lib/constants";
import {Button} from "@/components/ui/button";
import {Modal} from "@/components/shared/Modal";
import {useModalStore} from "@/lib/stores/modalStore";
import { Download, Plus} from "lucide-react";
import {getManagersColumns} from "@/components/dashboard/shared/data-table/columns/createColumnInTable/manager-colum";
import {useRouter} from 'next/navigation';
import {downloadBlobFile, isJsonBlob, parseBlobError} from "@/lib/utils";
import {reportsManager} from "@/services/reports";
import type {DateRange} from "react-day-picker";
import type {BlobError} from "@/types/error";
import {DateRangePicker} from "@/components/dashboard/shared/date-range-picker/DateRangePicker";

export default function ManagersPage() {
    const route = useRouter();
    const [managerToDelete, setManagerToDelete] = useState<string | null>(null);
    const { data = [], isLoading, isError } = useManagers();
    const { mutate: deleteManager, isPending: isDeleting  } = useDeleteManager();
    const { openModal } = useModalStore();
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [errorReport, setErrorReport] = useState<string | null>(null);

    const downloadReport = async () => {
        try {
            const res = await reportsManager({
                from: dateRange?.from?.toISOString(),
                to: dateRange?.to?.toISOString(),
            });

            downloadBlobFile({
                blob: res.data,
                disposition: res.headers?.["content-disposition"],
                filename: "report.xlsx",
                defaultName: "report.xlsx",
            });

            setDateRange(undefined);
            setErrorReport(null);
        } catch (e: unknown) {
            const err = e as BlobError;

            const data = err.response?.data;

            if (data && isJsonBlob(data)) {
                const parsed = await parseBlobError(data);
                setErrorReport(parsed.message ?? parsed.error ?? "Ошибка");
                return;
            }

            setErrorReport("Неизвестная ошибка при генерации отчёта");
        }
    };

    const columns = useMemo(
        () => getManagersColumns({
            onView: (user) => route.push(`managers/${user._id}`),
            onDelete: (user) => {
                setManagerToDelete(user._id);
                },
        }),
        [route]
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
            <div className="flex items-center justify-center gap-2">
                <Button
                    className="bg-[#1E2B6D] hover:bg-[#162356]"
                    onClick={() => openModal("createManager")}
                >
                    <Plus className="w-4 h-4 mr-2" /> Создать менеджера
                </Button>

                <Button
                    className="bg-[#1E2B6D] hover:bg-[#162356]"
                    onClick={() => openModal("reportAllManagers")}
                >
                    <Download className="w-4 h-4 mr-2" /> Отчет по всем менеджерам
                </Button>
            </div>
        </div>

        <Modal id="reportAllManagers" title="Выберете даты для отчета">
            <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                disableFuture
            />
            {errorReport && (
                <p className="text-sm text-red-500">{errorReport}</p>
            )}
            <Button
                className="w-full mt-4 bg-[#1E2B6D] hover:bg-[#162356]"
                onClick={downloadReport}
            >
                Скачать отчет
            </Button>
        </Modal>

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
          onRowClick={(user) => route.push(`managers/${user._id}`)}
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
