'use client';
import { format } from 'date-fns';
import OrderManageForm from '@/components/dashboard/orders/OrderManageForm';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/authHooks';
import { useOneOrder } from '@/lib/hooks/orderHooks';
import { Button } from '@/components/ui/button';
import { useDeleteOrder } from '@/lib/hooks/orderHooks';
import {
  Trash2,
  ArrowLeft,
  Download,
  Trash,
  Dot,
  Hash,
  Copy,
  User,
  CircleCheckBig,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useModalStore } from '@/lib/stores/modalStore';
import { Modal } from '@/components/shared/Modal';
import ContractForm from '@/components/dashboard/orders/ContractForm';
import { Spinner } from '@/components/ui/spinner';
import { PiHashStraightBold } from 'react-icons/pi';
import { formatDayAndMonthWords } from '@/lib/utils';

export default function OrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const user = useUser().data;

  const { openModal } = useModalStore();

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
        onError: () => {
          toast.error('Ошибка при удалениии');
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

  const { day, month, year } = formatDayAndMonthWords(order.createdAt);

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Скопировано!', { duration: 3000, position: 'top-center' });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const statusBadgeText = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Ожидает подтверждения',
        };
      case 'approved':
        return {
          text: 'Подтверждено',
        };
      case 'rejected':
        return {
          text: 'Отклонено',
        };
      default:
        return {
          text: 'В процессе',
        };
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 overflow-x-hidden">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-7">
          <div className="flex items-center justify-between gap-4 mb-7">
            <Button
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-cyan-800 hover:text-navy-800 transition cursor-pointer bg-0"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад к списку</span>
            </Button>
            {user?.role === 'ADMIN' && (
              <Button
                className="group inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-red-300 text-red-600 bg-white hover:bg-red-100 transition text-sm font-semibold cursor-pointer"
                type="button"
              >
                <Trash className="w-4 h-4" />
                <span>Удалить</span>
              </Button>
            )}
          </div>

          <header className="mb-8">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[12px] font-bold uppercase tracking-widest text-cyan-800">
                {order.tourSetId.tourId.category.title}
              </span>
              <Dot className="size-7 opacity-60 group-hover:opacity-100 text-gray-300" />

              <Button
                id="copyRef"
                className="group inline-flex items-center gap-1 font-light text-[12px] text-navy-700/60 hover:text-cyan-800 transition bg-0 cursor-pointer px-0"
                type="button"
                title="скопировать ID"
                onClick={() => handleCopy(order._id)}
              >
                <Hash className=" size-3 opacity-60 group-hover:opacity-100" />
                {order.visibleId}
                <Copy className=" size-3 opacity-60 group-hover:opacity-100" />
              </Button>
            </div>

            <h1 className="text-3xl md:text-[34px] font-black tracking-tight text-navy-800 leading-tight">
              {order.tourSetId.tourId.title}
            </h1>
            <p className="mt-2 text-navy-700/60 flex gap-1 items-center">
              Заявка от
              <span className="font-semibold text-navy-800">
                {order.clientName}
              </span>
              <Dot className="size-5 text-gray-300" />
              создана {day} {month} {year}
            </p>
          </header>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-line p-6">
                <h2 className="text-base font-extrabold text-navy-800 mb-5 flex items-center gap-2">
                  <User className="text-cyan-800" />
                  Контакт клиента
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border border-slate-300 rounded-2xl p-4">
                    <p className="text-slate-400 text-[13px] font-semibold mb-1">
                      Имя клиента
                    </p>
                    <p className="text-navy-700 text-md font-semibold mb-1 tracking-widest">
                      {order.clientName}
                    </p>
                  </div>

                  <div className="border border-slate-300 rounded-2xl p-4">
                    <p className="text-slate-400 text-[13px] font-semibold mb-1">
                      Телефон
                    </p>
                    <p className="text-navy-700 text-md font-semibold mb-1 tracking-widest">
                      {order.clientPhone}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-extrabold text-navy-800 flex items-center gap-2">
                    <CircleCheckBig className="text-cyan-800 size-4" />
                    Статус заявки
                  </h2>
                  <span
                    id="statusBadge"
                    className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-[12px] font-bold bg-slate-100 text-cyan-800"
                  >
                    <Dot />
                    {statusBadgeText(order.status).text}
                  </span>
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
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>
              Вы уверены, что хотите удалить эту заявку?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              Удалить {isDeleting && <Spinner/>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
    // <div className="min-h-screen bg-gray-50 p-8">
    //   <div className="max-w-5xl mx-auto space-y-6">
    //     <div className="flex items-center justify-between border-b border-gray-200 pb-3">
    //       <button
    //         onClick={() => router.back()}
    //         className="flex items-center text-[11px] font-bold uppercase tracking-widest text-[#64748B] hover:text-[#1E2B6D] transition-colors gap-2"
    //       >
    //         <ArrowLeft className="w-4 h-4" /> Назад к списку
    //       </button>
    //     </div>

    //     <div className="flex flex-col xl:flex-row md:items-center justify-between gap-4">
    //       <div className="space-y-1">
    //         <div className="flex items-center gap-3">
    //           <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1E2B6D] leading-none break-all min-w-0">
    //             Заявка № {order._id}
    //           </h1>
    //         </div>
    //       </div>

    //       {user?.role === 'ADMIN' && (
    //         <Button
    //           variant="destructive"
    //           size="sm"
    //           className="h-10 w-10 p-0 rounded-xl"
    //           onClick={() => setIsDeleteDialogOpen(true)}
    //         >
    //           <Trash2 className="w-4 h-4" />
    //         </Button>
    //       )}
    //       {order.status === 'CONTRACT_PENDING' && (
    //           <Button
    //               className="bg-[#1E2B6D] hover:bg-[#162356] cursor-pointer"
    //               onClick={() => openModal('contractModal')}
    //           >
    //             <Download className="w-4 h-4 mr-2" /> Генерировать контракт
    //           </Button>
    //       )}
    //     </div>

    //     <Modal id="contractModal" title="Впишите данные">
    //       <ContractForm orderId={order._id} />
    //     </Modal>

    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-start text-lg border-b border-gray-200 pb-4 mt-18">
    //       <h2 className="md:col-span-2text-xl border-b border-gray-100 pb-2">
    //         Тур{' '}
    //         <span className="font-bold ">{order.tourSetId.tourId.title}</span>
    //       </h2>

    //       <p>
    //         Категория:{' '}
    //         <span className="font-medium">
    //           {order.tourSetId.tourId.category.title}
    //         </span>
    //       </p>

    //       <p>
    //         Даты:{' '}
    //         <span className="font-bold">
    //           {format(new Date(order.tourSetId.startDate), 'dd.MM.yyyy')} -{' '}
    //           {format(new Date(order.tourSetId.endDate), 'dd.MM.yyyy')}
    //         </span>
    //       </p>

    //       <p>
    //         Цена: <span className="font-medium">{order.tourSetId.price}</span>
    //       </p>

    //       <p>
    //         Отель:{' '}
    //         <span className="font-medium">{order.tourSetId.hotelName}</span>
    //       </p>
    //     </div>

    //     <OrderManageForm
    // initialValues={{
    //   tourSetId: order.tourSetId._id,
    //   clientName: order.clientName,
    //   clientPhone: order.clientPhone,
    //   status: order.status,
    //   managerId: order.managerId?._id,
    //   rejectionReason: order.rejectionReason,
    // }}
    //       orderId={order._id}
    //     />

    //     <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
    //       <DialogContent>
    //         <DialogHeader className="pr-8">
    //           <DialogTitle>
    //             Вы уверены, что хотите удалить этот тур?
    //           </DialogTitle>
    //         </DialogHeader>
    //         <DialogFooter>
    //           <Button
    //             variant="outline"
    //             onClick={() => setIsDeleteDialogOpen(false)}
    //           >
    //             Отмена
    //           </Button>
    //           <Button
    //             variant="destructive"
    //             onClick={confirmDelete}
    //             disabled={isDeleting}
    //           >
    //             {isDeleting ? 'Удаление...' : 'Удалить'}
    //           </Button>
    //         </DialogFooter>
    //       </DialogContent>
    //     </Dialog>
    //   </div>
    // </div>
  );
}
