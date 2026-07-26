'use client';

import { useOrderStats } from '@/lib/hooks/orderHooks';
import {
  downloadBlobFile,
  formatToReadablePrice,
  isJsonBlob,
  isValidReportDate,
  cn,
  parseBlobError,
} from '@/lib/utils';
import {
  CircleCheck,
  Clock,
  DollarSign,
  Download,
  type LucideProps,
  TrendingUp,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useUser } from '@/lib/hooks/authHooks';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/shared/Modal';
import { DateRangePicker } from '@/components/dashboard/shared/date-range-picker/DateRangePicker';
import { useModalStore } from '@/lib/stores/modalStore';
import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useState,
} from 'react';
import type { DateRange } from 'react-day-picker';
import { reportsManager } from '@/services/reports';
import type { BlobError } from '@/types/error';
import { REPORT_BUTTONS } from '@/lib/constants';

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

    setDateRange({ from, to });
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
        disposition: res.headers?.['content-disposition'],
        filename: 'report.xlsx',
        defaultName: 'report.xlsx',
      });

      setDateRange(undefined);
      setErrorReport(null);
    } catch (e: unknown) {
      const err = e as BlobError;

      const data = err.response?.data;

      if (data && isJsonBlob(data)) {
        const parsed = await parseBlobError(data);
        setErrorReport(parsed.message ?? parsed.error ?? 'Ошибка');
        return;
      }

      setErrorReport('Неизвестная ошибка при генерации отчёта');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-red-500">Не удалось загрузить статистику</p>
    );
  }

  const widgets: {
    key: string;
    label: string;
    caption: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >;
    colorClass: string;
    iconBg: string;
    value: number | string;
  }[] = [
    {
      key: 'new',
      label: 'Новые заявки',
      caption: 'ждут распределения',
      icon: Clock,
      colorClass: 'bg-cyan-800',
      iconBg: 'bg-cyan-50 text-cyan-800',
      value: data.byStatus.NEW,
    },
    {
      key: 'in_progress',
      label: 'В работе',
      caption: 'на сопровождении',
      icon: TrendingUp,
      colorClass: 'bg-navy-800',
      iconBg: 'bg-slate-400/10 text-navy-800',
      value: data.byStatus.IN_PROGRESS,
    },
    {
      key: 'completed_today',
      label: 'Выполнено сегодня',
      caption: 'закрытых за день',
      icon: CircleCheck,
      colorClass: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-500',
      value: data.completedToday,
    },
  ];

  return (
    <>
      <div
        className={cn(
          'grid gap-4 mt-5 grid-cols-1',
          user?.role === 'ADMIN' ? 'md:grid-cols-4' : 'md:grid-cols-3',
        )}
      >
        {widgets.map(
          ({ key, label, caption, value, icon: Icon, colorClass, iconBg }) => (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-slate-300 bg-white p-6"
            >
              <div
                className={cn('absolute left-0 top-0 h-full w-2.5', colorClass)}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500/55">
                    {label}
                  </p>
                  <p className="mt-2 text-[56px] leading-[0.9] font-black tracking-tight text-navy-800">
                    {value}
                  </p>
                </div>

                <div
                  className={cn(
                    'flex size-11 items-center justify-center rounded-xl',
                    iconBg,
                  )}
                >
                  <Icon className="size-[22px]" />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-navy-800/40">
                {caption}
              </p>
            </div>
          ),
        )}
        {user?.role === 'ADMIN' && (
          <div className="group relative overflow-hidden rounded-2xl bg-navy-800 p-6">
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white/55">
                  Выручка за месяц
                </p>
                <p className="mt-2 text-[34px] leading-[0.95] font-black tracking-tight text-white">
                  {formatToReadablePrice(data.monthRevenue).price}
                </p>
                <p className="mt-1 text-sm font-bold text-cyan-300">сом</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                <DollarSign className="size-[22px]" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-4">
        {user?.role === 'ADMIN' && (
          <Button
            onClick={() => openModal('reportAllManagers')}
            className="group cursor-pointer w-full justify-center gap-2.5 rounded-xl bg-navy-800 size-12 px-5 text-sm font-semibold text-white transition hover:bg-white hover:border-slate-400 hover:text-navy-800 active:scale-[0.98] sm:w-auto "
          >
            <span className="flex size-6 items-center justify-center rounded-lg bg-white/15 text-cyan-300 transition group-hover:bg-cyan-300/20 group-hover:text-cyan-800">
              <Download className="size-3.5" strokeWidth={2.5} />
            </span>
            Отчет по всем менеджерам
          </Button>
        )}
      </div>

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
          onChangeAction={setDateRange}
          disableFuture
        />
        {errorReport && <p className="text-sm text-red-500">{errorReport}</p>}
        <Button
          className="w-full mt-4 bg-[#1E2B6D] hover:bg-[#162356]"
          onClick={downloadReport}
          disabled={isDownloading}
        >
          {isDownloading ? <Spinner /> : 'Скачать отчет'}
        </Button>
      </Modal>
    </>
  );
};
