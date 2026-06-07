'use client';
import {useParams, useRouter} from 'next/navigation';
import {useDeleteManager, useOneManager} from '@/lib/hooks/managerHook';
import {Spinner} from '@/components/ui/spinner';
import {
  UpdateManagerForm
} from '@/components/dashboard/managers/UpdateManagerForm';
import OrderTable from '@/components/dashboard/orders/OrderTable';
import {Button} from "@/components/ui/button";
import {Delete, Download} from "lucide-react";
import {useModalStore} from "@/lib/stores/modalStore";
import {Modal} from "@/components/shared/Modal";
import {
  DateRangePicker
} from "@/components/dashboard/shared/date-range-picker/DateRangePicker";
import {useState} from "react";
import type {DateRange} from "react-day-picker";
import {reportsManager} from "@/services/reports";
import {downloadBlobFile, isJsonBlob, parseBlobError} from "@/lib/utils";
import type {BlobError} from "@/types/error";
import {
  ConfirmDialog
} from "@/components/dashboard/ConfirmDialog/ConfirmDialog";
import {toast} from "sonner";

export default function Manager() {
  const {id} = useParams();
  const [managerToDelete, setManagerToDelete] = useState<string | null>(null);
  const router = useRouter();
  const {data: manager, isLoading, error} = useOneManager(id as string);
  const {mutate: deleteManager, isPending: isDeleting} = useDeleteManager();
  const {openModal} = useModalStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [errorReport, setErrorReport] = useState<string | null>(null);

  const downloadReport = async () => {
    try {
      const res = await reportsManager({
        managerId: id?.toString(),
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

  if (!manager) {
    return <h1>Менеджер не найден</h1>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const confirmDelete = () => {
    if (!managerToDelete) return

    deleteManager(managerToDelete, {
      onSuccess: () => {
        toast("Менеджер успешно удалён")
        router.push("/admin/managers")
      },
      onSettled: () => {
        setManagerToDelete(null)
      }
    })
  };

  return (
    <section>
      <div className="flex items-center justify-between flex-wrap mb-4">
        <h1 className="text-2xl font-bold">Страница просмотра менеджера</h1>
        <div className="flex items-center gap-3">
          <Button
            className="bg-destructive opacity-80 text-white hover:opacity-100"
            onClick={() => setManagerToDelete(id as string)}
          >
            <Delete className="w-4 h-4" /> Удалить менеджера <span className="block underline">{manager.fullName}</span>
          </Button>
          <Button
            className="bg-[#1E2B6D] hover:bg-[#162356]"
            onClick={() => openModal("reportManager")}
          >
            <Download className="w-4 h-4 mr-2" /> Отчет по менеджеру <span className="block underline">{manager.fullName}</span>
          </Button>
        </div>
      </div>
      <div className="my-3">
        <UpdateManagerForm initialValues={manager} />
      </div>
      <OrderTable />

      <Modal
        id="reportManager"
        title="Отчет по менеджеру"
      >
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

      <ConfirmDialog
        open={!!managerToDelete}
        title="Удалить менеджера?"
        description="Это действие нельзя отменить"
        loading={isDeleting}
        confirmText="Удалить"
        onCancel={() => setManagerToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
