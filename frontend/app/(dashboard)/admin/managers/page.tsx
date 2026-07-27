'use client';

import {useManagers, useSetStatusManager} from '@/lib/hooks/managerHook';
import {
    CreateManagerForm
} from '@/components/dashboard/managers/CreateManagerForm';
import {DataTable} from '@/components/dashboard/shared/data-table/data-table';
import {
    ConfirmDialog
} from '@/components/dashboard/ConfirmDialog/ConfirmDialog';
import {useEffect, useMemo, useState} from 'react';
import {
    headerRowClassName,
    rowClassName,
    tableClassName,
    USER_STATUS_LABELS,
    UserStatus
} from '@/lib/constants';
import {Button} from '@/components/ui/button';
import {Modal} from '@/components/shared/Modal';
import {useModalStore} from '@/lib/stores/modalStore';
import {Download, Plus, Search} from 'lucide-react';
import {
    getManagersColumns
} from '@/components/dashboard/shared/data-table/columns/createColumnInTable/manager-colum';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {downloadBlobFile, isJsonBlob, parseBlobError} from '@/lib/utils';
import {reportsManager} from '@/services/reports';
import type {DateRange} from 'react-day-picker';
import type {BlobError} from '@/types/error';
import {
    DateRangePicker
} from '@/components/dashboard/shared/date-range-picker/DateRangePicker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {useDebounce} from 'use-debounce';
import {Input} from '@/components/ui/input';

export default function ManagersPage() {
    const route = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [managerToChange, setManagerToChange] = useState<string | null>(null);
    const { mutate: setStatusManager, isPending: isChanging  } = useSetStatusManager();
    const { openModal } = useModalStore();
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [errorReport, setErrorReport] = useState<string | null>(null);

    const fullName = searchParams.get('fullName');
    const status = searchParams.get('status') || undefined;

    const [searchInput, setSearchInput] = useState<string>(fullName ?? '');
    const [debouncedSearch] = useDebounce(searchInput, 400);

    const onChangeStatus = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('status', val);
        route.push(`${pathname}?${params.toString()}`);
    };

    const { data = [], isLoading, isError } = useManagers({ fullName: fullName ?? undefined, status: status as UserStatus });

    useEffect(() => {
        const currentFullName = searchParams.get('fullName') ?? '';

        if (currentFullName === debouncedSearch) return;

        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set('fullName', debouncedSearch);
        } else {
            params.delete('fullName');
        }
        route.push(`${pathname}?${params.toString()}`);
    },[debouncedSearch, pathname, route, searchParams]);

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
            onBanned: (user) => {
                setManagerToChange(user._id);
            }
        }),
        [route]
    );

    const confirmSetStatus = () => {
        if (!managerToChange) return;

        setStatusManager(managerToChange, {
          onSettled: () => setManagerToChange(null),
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
              onClick={() => openModal('createManager')}
            >
              <Plus className="w-4 h-4 mr-2" /> Создать менеджера
            </Button>

            <Button
              className="w-full justify-center gap-2 bg-[#1E2B6D] hover:bg-[#162356] sm:w-auto"
              onClick={() => openModal('reportAllManagers')}
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>Отчет по всем менеджерам</span>
            </Button>
          </div>
        </div>

        <div>
          <div className="flex justify-end gap-2 items-center">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Поиск по имени..."
                className="pl-9 bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-offset-0 transition-colors focus-visible:border-primary h-8"
              />
            </div>

            <Select value={status ?? 'active'} onValueChange={onChangeStatus}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>

              <SelectContent>
                {Object.values(UserStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {USER_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Modal id="reportAllManagers" title="Выберете даты для отчета" description="Отчеты для менеджеров">
          <DateRangePicker
            value={dateRange}
            onChangeAction={setDateRange}
            disableFuture
          />
          {errorReport && <p className="text-sm text-red-500">{errorReport}</p>}
          <Button
            className="w-full mt-4 bg-[#1E2B6D] hover:bg-[#162356]"
            onClick={downloadReport}
          >
            Скачать отчет
          </Button>
        </Modal>

        <Modal id="createManager" title="Создание менеджера" description="Форма создание менеджеров">
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
          onRowClickAction={(user) => route.push(`managers/${user._id}`)}
        />

        <ConfirmDialog
          open={!!managerToChange}
          title={`${data?.find((m) => m._id === managerToChange)?.status !== 'banned' ? 'Забанить' : 'Разбанить'} менеджера?`}
          description="Это действие нельзя отменить"
          loading={isChanging}
          confirmText={`${data?.find((m) => m._id === managerToChange)?.status !== 'banned' ? 'Забанить' : 'Разбанить'}`}
          onCancelAction={() => setManagerToChange(null)}
          onConfirmAction={confirmSetStatus}
        />
      </div>
    );
}
