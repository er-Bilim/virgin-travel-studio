'use client';
import {useParams} from 'next/navigation';
import {useOneManager, useSetStatusManager} from '@/lib/hooks/managerHook';
import {Spinner} from '@/components/ui/spinner';
import {
  UpdateManagerForm
} from '@/components/dashboard/managers/UpdateManagerForm';
import OrderTable from '@/components/dashboard/orders/OrderTable';
import {Button} from '@/components/ui/button';
import {Delete, Download, KeyRound, Undo} from 'lucide-react';
import {
  ChangeManagerPasswordForm
} from '@/components/dashboard/managers/ChangeManagerPasswordForm';
import {useModalStore} from '@/lib/stores/modalStore';
import {Modal} from '@/components/shared/Modal';
import {
  DateRangePicker
} from '@/components/dashboard/shared/date-range-picker/DateRangePicker';
import {useState} from 'react';
import type {DateRange} from 'react-day-picker';
import {reportsManager} from '@/services/reports';
import {downloadBlobFile, isJsonBlob, parseBlobError} from '@/lib/utils';
import type {BlobError} from '@/types/error';
import {
  ConfirmDialog
} from '@/components/dashboard/ConfirmDialog/ConfirmDialog';

export default function Manager() {
  const {id} = useParams();
  const [managerToChange, setManagerToChange] = useState<string | null>(null);
  const {data: manager, isLoading, error} = useOneManager(id as string);
  const {
    mutate: setStatusManager,
    isPending: isChanging
  } = useSetStatusManager();
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

  const confirmSetStatus = () => {
    if (!managerToChange) return;

    setStatusManager(managerToChange, {
      onSettled: () => setManagerToChange(null),
    });
  };

  return (
    <section>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:flex-wrap">
        <h1 className="text-2xl font-bold">Страница просмотра менеджера</h1>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Button
            className={`w-full justify-center sm:w-auto ${manager?.status !== 'banned' ? "bg-destructive opacity-80 text-white hover:opacity-100" : "bg-emerald-600 text-white hover:opacity-100"}`}
            onClick={() => setManagerToChange(id as string)}
          >
            {manager?.status !== 'banned' ? (
                <>
                  <Delete className="w-4 h-4" />Забанить <span className="block underline truncate">{manager.fullName}</span>
                </>
              )
              :
              <>
                <Undo className="w-4 h-4" />Разбанить <span className="block underline truncate">{manager.fullName}</span>
              </>
            }

          </Button>
          <Button
            className="w-full justify-center sm:w-auto bg-[#1E2B6D] hover:bg-[#162356]"
            onClick={() => openModal("reportManager")}
          >
            <Download className="w-4 h-4 mr-2" /> Отчет по менеджеру <span className="block underline truncate">{manager.fullName}</span>
          </Button>
          <Button
            className="w-full justify-center sm:w-auto bg-[#1E2B6D] hover:bg-[#162356]"
            onClick={() => openModal("changeManagerPassword")}
          >
            <KeyRound className="w-4 h-4 mr-2" /> Сменить пароль <span className="block underline truncate">{manager.fullName}</span>
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
          onChangeAction={setDateRange}
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

      <Modal
        id="changeManagerPassword"
        title="Смена пароля менеджера"
      >
        <ChangeManagerPasswordForm managerId={id as string} />
      </Modal>

      <ConfirmDialog
        open={!!managerToChange}
        title={`${manager?.status !== 'banned' ? 'Забанить' : 'Разбанить'} менеджера?`}
        description="Это действие нельзя отменить"
        loading={isChanging}
        confirmText={`${manager?.status !== 'banned' ? 'Забанить' : 'Разбанить'}`}
        onCancelAction={() => setManagerToChange(null)}
        onConfirmAction={confirmSetStatus}
      />
    </section>
  );
}