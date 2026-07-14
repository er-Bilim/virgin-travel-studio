'use client';

import {useOrderStats} from '@/lib/hooks/orderHooks';
import {
  downloadBlobFile,
  formatToReadablePrice,
  isJsonBlob,
  isValidReportDate,
  cn,
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
  FileText,
  TrendingUp
} from 'lucide-react';
import {Spinner} from '@/components/ui/spinner';
import {useUser} from '@/lib/hooks/authHooks';
import {Button} from '@/components/ui/button';
import {Modal} from '@/components/shared/Modal';
import {
  DateRangePicker
} from '@/components/dashboard/shared/date-range-picker/DateRangePicker';
import {useModalStore} from '@/lib/stores/modalStore';
import {useState} from 'react';
import type {DateRange} from 'react-day-picker';
import {reportsManager} from '@/services/reports';
import type {BlobError} from '@/types/error';
import {REPORT_BUTTONS} from '@/lib/constants';


export const StatsWidgets = () => {
  const { data, isLoading, isError } = useOrderStats();
  const { data: user } = useUser();
  const { openModal } = useModalStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [errorReport, setErrorReport] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const onBtnDateClick = (button: string) => {
    const to = new Date();
    to.setHours(23, 59, 59, 999);

    const from = new Date();
    from.setHours(0, 0, 0, 0);

    switch (button) {
      case 'Сегодня':
        break;
      case 'Неделя':
        from.setDate(from.getDate() - 7);
        break;
      case 'Месяц':
        from.setMonth(from.getMonth() - 1);
        break;
      case '3 месяца':
        from.setMonth(from.getMonth() - 3);
    }

    setDateRange({from, to});
  };

  const downloadReport = async () => {
    const validationError = isValidReportDate(dateRange);
    if (validationError) {
      setErrorReport(validationError);
      return;
    }

    setIsDownloading(true);
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

  const widgets = [
    user?.role === 'MANAGER'
      ? {
          key: 'contract_pending',
          label: 'Ожидают контракта',
          icon: FileText,
          colorClass: 'bg-purple-100 text-purple-700',
          iconBg: 'bg-purple-200',
          value: data.byStatus.CONTRACT_PENDING,
        }
      : {
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
    ...(user?.role === 'ADMIN'
    ? [
        {
          key: 'revenue',
          label: 'Выручка за месяц',
          icon: CircleDollarSign,
          colorClass: 'bg-purple-100 text-purple-700',
          iconBg: 'bg-purple-200',
          value: formatToReadablePrice(data.monthRevenue).price,
        },
      ]
    : []),
  ];
  
  return (
      <>
        <div className={cn(
            'grid gap-4 mt-5',
            user?.role === 'ADMIN' ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'
            )}
        >
          {widgets.map(({ key, label, icon: Icon, colorClass, iconBg, value }) => (
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

        {user?.role === 'ADMIN' &&
            <div className="flex justify-end mt-4">
              <Button
                  className="w-full justify-center gap-2 bg-[#1E2B6D] hover:bg-[#162356] sm:w-auto"
                  onClick={() => openModal('reportAllManagers')}
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>Отчет по всем менеджерам</span>
              </Button>
            </div>
        }

        <Modal id="reportAllManagers" title="Выберете даты для отчета">
          <div className="flex justify-content-start align-items-center gap-2">
            {REPORT_BUTTONS.map((button) => (
                <Button
                    key={button}
                    type="button"
                    className="cursor-pointer bg-[#1E2B6D] hover:bg-[#162356]"
                    onClick={() => onBtnDateClick(button)}
                >
                  {button}
                </Button>
            ))}
          </div>

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