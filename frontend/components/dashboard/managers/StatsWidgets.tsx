'use client';

import {useOrderStats} from '@/lib/hooks/orderHooks';
import {
  downloadBlobFile,
  formatToReadablePrice,
  isJsonBlob,
  parseBlobError
} from '@/lib/utils';
import {
  CheckCircle,
  CircleDollarSign,
  Clock,
  Download,
  type LucideProps,
  TrendingUp
} from 'lucide-react';
import {Spinner} from '@/components/ui/spinner';
import {useUser} from '@/lib/hooks/authHooks';
import {Button} from "@/components/ui/button";
import {Modal} from "@/components/shared/Modal";
import {
  DateRangePicker
} from "@/components/dashboard/shared/date-range-picker/DateRangePicker";
import {useModalStore} from "@/lib/stores/modalStore";
import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useState
} from "react";
import type {DateRange} from "react-day-picker";
import {reportsManager} from "@/services/reports";
import type {BlobError} from "@/types/error";


export const StatsWidgets = () => {
  const {data, isLoading, isError} = useOrderStats();
  const {data: user} = useUser();
  const {openModal} = useModalStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [errorReport, setErrorReport] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const downloadReport = async () => {
    try {
      const res = await reportsManager({
        from: dateRange?.from?.toISOString(),
        to: dateRange?.to?.toISOString(),
      });
      setIsDownloading(true);
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
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-500">Не удалось загрузить статистику</p>
    );
  }

  let widgets: {
    key: string,
    label: string,
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>,
    colorClass: string,
    iconBg: string,
    value: number | string,
  }[] = [];

  if (user?.role === 'ADMIN') {
    widgets = [
      {
        key: 'new',
        label: 'Новые заявки',
        icon: Clock,
        colorClass: 'bg-blue-100 text-blue-700',
        iconBg: 'bg-blue-200',
        value: data.byStatus.NEW,
      },
      {
        key: 'in_progress',
        label: 'В работе',
        icon: TrendingUp,
        colorClass: 'bg-yellow-100 text-yellow-700',
        iconBg: 'bg-yellow-200',
        value: data.byStatus.IN_PROGRESS,
      },
      {
        key: 'completed_today',
        label: 'Выполнено сегодня',
        icon: CheckCircle,
        colorClass: 'bg-green-100 text-green-700',
        iconBg: 'bg-green-200',
        value: data.completedToday,
      },
      {
        key: 'revenue',
        label: 'Выручка за месяц',
        icon: CircleDollarSign,
        colorClass: 'bg-purple-100 text-purple-700',
        iconBg: 'bg-purple-200',
        value: formatToReadablePrice(data.monthRevenue).price,
      },
    ];
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-5">
        {widgets.map(({key, label, icon: Icon, colorClass, iconBg, value}) => (
          <div
            key={key}
            className={`rounded-2xl border p-5 flex flex-col gap-3 ${colorClass}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="text-2xl font-bold mt-0.5">
                {value}{key === 'revenue' && ' сом'}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        {user?.role === 'ADMIN' && (
          <Button
            className="w-full justify-center gap-2 bg-[#1E2B6D] hover:bg-[#162356] sm:w-auto"
            onClick={() => openModal('reportAllManagers')}
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Отчет по всем менеджерам</span>
          </Button>
        )}
      </div>

      <Modal
        id="reportAllManagers"
        title="Выберете даты для отчета"
      >
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          disableFuture
        />
        {errorReport && <p className="text-sm text-red-500">{errorReport}</p>}
        <Button
          className="w-full mt-4 bg-[#1E2B6D] hover:bg-[#162356]"
          onClick={downloadReport}
          disabled={isDownloading}
        >
          {isDownloading ? <Spinner /> : "Скачать отчет"}
        </Button>
      </Modal>
    </>
  );
};