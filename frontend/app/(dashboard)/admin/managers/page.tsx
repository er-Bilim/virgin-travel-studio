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
        <div className="min-h-screen bg-background p-4 space-y-6 sm:p-6 lg:p-8 lg:space-y-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
                    Менеджеры
                </h1>

                <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                    <Button
                        className="w-full justify-center bg-[#1E2B6D] hover:bg-[#162356] sm:w-auto"
                        onClick={() => openModal("createManager")}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Создать менеджера
                    </Button>

                    <Button
                        className="w-full justify-center gap-2 bg-[#1E2B6D] hover:bg-[#162356] sm:w-auto"
                        onClick={() => openModal("reportAllManagers")}
                    >
                        <Download className="h-4 w-4 shrink-0" />
                        <span>Отчет по всем менеджерам</span>
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
