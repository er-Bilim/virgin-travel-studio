'use client';
import { format } from 'date-fns';
import OrderManageForm from '@/components/dashboard/orders/OrderManageForm';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/authHooks';
import { useOneOrder } from '@/lib/hooks/orderHooks';
import { Button } from '@/components/ui/button';
import { useDeleteOrder } from '@/lib/hooks/orderHooks';
import { Trash2, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function OrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const user = useUser().data;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: order, isLoading, error, refetch } = useOneOrder(id as string);

  const { mutate: deleteData, isPending: isDeleting } = useDeleteOrder();

  const confirmDelete = () => {
    if (order) {
      deleteData(order._id, {
        onSuccess: () => {
          toast.success('Заявка успешно удалена');
          router.back();
        },
        onError: (error) => {
          toast.error("Ошибка при удалениии")
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Загрузка заявки...</div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-[#1E2B6D] font-bold">Не удалось загрузить заявку</p>
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
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-white">Заявка не найдена</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[11px] font-bold uppercase tracking-widest text-[#64748B] hover:text-[#1E2B6D] transition-colors gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к списку
          </button>
        </div>

        <div className="flex flex-col xl:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1E2B6D] leading-none break-all min-w-0">
                Заявка № {order._id}
              </h1>
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <Button
              variant="destructive"
              size="sm"
              className="h-10 w-10 p-0 rounded-xl"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-start text-lg border-b border-gray-200 pb-4 mt-18">
          <h2 className="md:col-span-2text-xl border-b border-gray-100 pb-2">
            Тур{' '}
            <span className="font-bold ">{order.tourSetId.tourId.title}</span>
          </h2>

          <p>
            Категория:{' '}
            <span className="font-medium">
              {order.tourSetId.tourId.category.title}
            </span>
          </p>

          <p>
            Даты:{' '}
            <span className="font-bold">
              {format(new Date(order.tourSetId.startDate), 'dd.MM.yyyy')} -{' '}
              {format(new Date(order.tourSetId.endDate), 'dd.MM.yyyy')}
            </span>
          </p>

          <p>
            Цена: <span className="font-medium">{order.tourSetId.price}</span>
          </p>

          <p>
            Отель:{' '}
            <span className="font-medium">{order.tourSetId.hotelName}</span>
          </p>
        </div>

        <OrderManageForm
          initialValues={{
            tourSetId: order.tourSetId._id,
            clientName: order.clientName,
            clientPhone: order.clientPhone,
            status: order.status,
            managerId: order.managerId?._id,
            rejectionReason: order.rejectionReason,
          }}
          orderId={order._id}
        />

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader className="pr-8">
              <DialogTitle>
                Вы уверены, что хотите удалить этот тур?
              </DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
