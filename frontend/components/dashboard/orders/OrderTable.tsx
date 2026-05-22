'use client';

import { DataTable } from '@/components/dashboard/shared/data-table/data-table';
import { getOrdersColumns } from '@/components/dashboard/shared/data-table/columns/createColumnInTable/order-columns';
import { useMemo, useState } from 'react';
import { useOrders } from '@/lib/hooks/orderHooks';
import { useManagers } from '@/lib/hooks/managerHook';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Loader, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useDeleteOrder } from '@/lib/hooks/orderHooks';
import { useUser } from '@/lib/hooks/authHooks';
import { toast } from 'sonner';

export default function OrderTable () {
  const [page, setPage] = useState(1);
  const route = useRouter();
  const {data: user} = useUser();
    const {
      mutate: delOrder,
      isPending,
    } = useDeleteOrder();

  const [selectedManagerId, setSelectedManagerId] = useState<string>();
  const columns = useMemo(
    () =>
      getOrdersColumns({
        onView: (order) => route.push(`leads/${order._id}`),
        onDelete: (order) => delOrder(order._id, {
          onError: () => {
            toast.error("Ошибка при удалениии");
          }
        }),
      }),
    [],
  );
  const { data = [], isLoading, error, refetch } = useOrders();
  const {
    data: managers = [],
    isLoading: managerLoading,
    isError: managerError,
  } = useManagers();

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
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D]">
            Заявки
          </h1>
          <div className="flex items-center gap-4">
            {user?.role === 'ADMIN' && (
              <Select
                value={selectedManagerId}
                onValueChange={(val) => {
                  setSelectedManagerId(val);
                  setPage(1);
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
            
            <Link href={`leads/new`}>
              <Button className="bg-[#1E2B6D] hover:bg-[#162356]">
                <Plus className="w-4 h-4 mr-2" /> Добавить заявку
              </Button>
            </Link>
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Загрузка туров...</div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-[#1E2B6D] font-bold">
              Не удалось загрузить список Туров
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
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </>
  );
};

