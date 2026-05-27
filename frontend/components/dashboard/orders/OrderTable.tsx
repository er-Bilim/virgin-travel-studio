'use client';

import {DataTable} from '@/components/dashboard/shared/data-table/data-table';
import {
  getOrdersColumns
} from '@/components/dashboard/shared/data-table/columns/createColumnInTable/order-columns';
import {useMemo, useState} from 'react';
import {useDeleteOrder, useOrders} from '@/lib/hooks/orderHooks';
import {useManagers} from '@/lib/hooks/managerHook';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {Loader} from 'lucide-react';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams
} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {useUser} from '@/lib/hooks/authHooks';
import {toast} from 'sonner';
import {ORDER_STATUS_LABELS, OrderStatus} from '@/lib/constants';

export default function OrderTable () {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const limit = Number(searchParams.get('limit') ?? 10);
  const page = Number(searchParams.get('page') ?? 1);
  const status = (searchParams.get('status') as OrderStatus) || undefined;

  const [selectedManagerId, setSelectedManagerId] = useState<string | undefined>(id as string);

  const onChangeStatus = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (val === 'all') {
      params.delete('status');
    }
    else {
      params.set('status', val);
    }

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const onChangePage = (numPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(numPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const {data: user} = useUser();
    const {
      mutate: delOrder,
      isPending,
    } = useDeleteOrder();


  const columns = useMemo(
    () =>
      getOrdersColumns({
        role: user?.role,
        onView: (order) => router.push(`leads/${order._id}`),
        onDelete: (order) => delOrder(order._id, {
          onError: () => {
            toast.error("Ошибка при удалениии");
          }
        }),
      }),
    [user?.role, delOrder, router],
  );

  const {
    data: managers = [],
    isLoading: managerLoading,
    isError: managerError,
  } = useManagers();

   const { data, isLoading, error, refetch } = useOrders({ page, limit, managerId: selectedManagerId, status });

if (isPending) {
  return (
    <div className="rounded-2xl border bg-white">
      <div className="p-8 text-center text-gray-500">
        <Loader className="animate-spin w-5 h-5 mx-auto" />
      </div>
    </div>
  );
}

  return (
    <>
      <div className="p-8 rounded-3xl space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
            Заявки
          </h1>
          <div className="flex items-center gap-4">
            <Select value={status ?? 'all'} onValueChange={onChangeStatus}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {ORDER_STATUS_LABELS[status]}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {user?.role === 'ADMIN' && (
              <>
                {!id && (
                  <Select
                    value={selectedManagerId}
                    onValueChange={(val) => {
                      setSelectedManagerId(val === 'all' ? undefined : val);
                      onChangePage(1);
                    }}
                  >
                    <SelectTrigger className="w-[200px] bg-white">
                      <SelectValue placeholder="Все менеджеры" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все менеджеры</SelectItem>
                      {managerLoading ? (
                        <div>загрузка...</div>
                      ) : managerError ? (
                        <div>Ошибка загрузки</div>
                      ) : managers?.length === 0 ? (
                        <div>Пока нет менеджеров</div>
                      ) : (
                        managers?.map((manager) => (
                          <SelectItem key={manager._id} value={manager._id}>
                            {manager.fullName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </>
            )}

          </div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Загрузка туров...</div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-[#1E2B6D] font-bold">
              Не удалось загрузить список Заявок
            </p>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto">
              Проверьте интернет-соединение или попробуйте перезагрузить данные
              вручную.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2 border-gray-200 text-[#1E2B6D]"
            >
              Повторить попытку
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.orders || []}
            pagination={{
              page: page,
              pageSize: limit,
              total: data?.meta.total ?? 0,
              onPageChange: onChangePage,
            }}
          />
        )}
      </div>
    </>
  );
};