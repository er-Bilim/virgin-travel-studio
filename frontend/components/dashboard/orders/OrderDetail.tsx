'use client';

import OrderManageForm from '@/components/dashboard/orders/OrderManageForm';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/authHooks';
import { useOneOrder } from '@/lib/hooks/orderHooks';
import { Button } from '@/components/ui/button';
import { useDeleteOrder } from '@/lib/hooks/orderHooks';
import {
  ArrowLeft,
  Trash,
  Dot,
  Hash,
  Copy,
  User,
  CircleCheckBig,
  UsersRound,
  TriangleAlert,
  ScrollText,
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
import { cn, formatDayAndMonthWords, formatToReadablePrice } from '@/lib/utils';
import type { SeatsLevel } from '@/lib/tour/seats';
import getSeatsLevel from '@/lib/tour/seats';

const styles: Record<SeatsLevel, { style: string }> = {
  available: {
    style: 'emerald-500',
  },
  low: {
    style: 'yellow-500',
  },
  critical: {
    style: 'red-500',
  },
  'sold-out': {
    style: 'gray-400',
  },
};

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
  const {
    day: tourDayStart,
    month: tourMonthStart,
    year: tourYearStart,
  } = formatDayAndMonthWords(order.tourSetId.startDate, true);
  const {
    day: tourDayEnd,
    month: tourMonthEnd,
    year: tourYearEnd,
  } = formatDayAndMonthWords(order.tourSetId.endDate, true);

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

  const { price, currency } = formatToReadablePrice(order.tourSetId.price);
  const totalSeats = order.tourSetId.totalSeats;
  const bookedSeats = order.tourSetId.bookedSeats;
  const freeSeats = totalSeats - bookedSeats;
  const seatLevel = getSeatsLevel(freeSeats, totalSeats);
  const isOrderPending: boolean = order.status === 'CONTRACT_PENDING';

  const getSeatLevelText = (level: SeatsLevel) => {
    switch (level) {
      case 'available':
        return `Забронировано ${bookedSeats} из ${totalSeats}`;
      case 'low':
        return `Среднее количество мест – забронировано ${bookedSeats} из ${totalSeats}`;
      case 'critical':
        return `Осталось мало мест – забронировано ${bookedSeats} из ${totalSeats}`;
      default:
        return '';
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 overflow-x-hidden">
        <div className="max-w-full mx-auto px-5 md:px-8 py-7">
          <div className="flex items-center justify-between gap-4 mb-7">
            <Button
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-cyan-800 hover:text-navy-800 transition cursor-pointer bg-0"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад к списку</span>
            </Button>
            <div className="flex items-center gap-4">
              <button
                className={cn(
                  'group inline-flex items-center gap-2 h-10 px-6 py-7 rounded-xl bg-navy-800 text-white font-semibold text-sm  cursor-not-allowed',
                  !isOrderPending
                    ? ' cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-navy-900 transition',
                )}
                onClick={() => openModal('contractModal')}
                disabled={!isOrderPending}
              >
                <ScrollText className="size-5 text-cyan-400" />
                Генерировать контракт
              </button>
              {user?.role === 'ADMIN' && (
                <Button
                  className="group inline-flex items-center gap-2 h-10 px-6 py-7 rounded-xl border border-red-300 text-red-600 bg-white hover:bg-red-100 transition text-sm font-semibold cursor-pointer"
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="w-4 h-4" />
                  <span>Удалить</span>
                </Button>
              )}
            </div>
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

          <div className="grid lg:grid-cols-[1fr_530px] gap-6 items-start">
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

            <aside className="space-y-6 lg:sticky lg:top-6">
              <section className="bg-white rounded-2xl border border-line overflow-hidden ">
                <div className="bg-navy-800 px-5 py-4 text-white">
                  <h2 className="text-[11px] uppercase tracking-wide text-cyan-300 font-bold mb-1">
                    Тур
                  </h2>
                  <p className="font-extrabold text-lg leading-snug">
                    {order.tourSetId.tourId.title}
                  </p>
                </div>
                <div className="p-5 space-y-3 text-[14px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Категория</span>
                    <span className="font-semibold text-navy-800">
                      {order.tourSetId.tourId.category.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Даты</span>
                    <p className="font-semibold text-navy-800 flex gap-1">
                      {tourDayStart} {tourMonthStart} {tourYearStart}
                      <span>–</span>
                      {tourDayEnd} {tourMonthEnd} {tourYearEnd}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Отель</span>
                    <span className="font-semibold text-navy-800">
                      {order.tourSetId.hotelName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Стоимость</span>
                    <p className="font-black text-navy-800 flex gap-1 text-lg items-center">
                      <span>{price}</span>
                      <span className="text-sm font-bold text-slate-400">
                        {currency}
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold uppercase tracking-wide text-navy-700 flex items-center gap-2">
                    <UsersRound className="text-cyan-800 size-5" />
                    Свободные места
                  </h3>
                </div>

                <div>
                  <div className="flex items-end gap-2 mb-3">
                    <span
                      className={cn(
                        `text-${styles[seatLevel].style} text-4xl font-black leading-none`,
                      )}
                    >
                      {freeSeats}
                    </span>
                    <span className="text-navy-700/50 font-semibold mb-0.5">
                      / <span id="seatTotal">{totalSeats}</span> мест
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={cn(
                        `bg-${styles[seatLevel].style} h-full rounded-full`,
                      )}
                      style={{ width: `${( Math.max(0, Math.min(100, totalSeats ? (freeSeats / totalSeats) * 100 : 0)))}%` }}
                    />
                  </div>

                  <p
                    id="seatNote"
                    className={cn(
                      `mt-5 text-[13px] text-${styles[seatLevel].style} font-semibold`,
                    )}
                  >
                    {getSeatLevelText(seatLevel)}
                  </p>
                </div>

                {seatLevel === 'sold-out' && (
                  <div>
                    <div className="rounded-xl bg-red-100 border border-red-200 p-4 flex items-start gap-3">
                      <TriangleAlert className="size-5 text-red-600 shrink-0 mt-1" />
                      <div>
                        <p className="font-extrabold text-red-600 text-[15px]">
                          Мест нет
                        </p>
                        <p className="text-[13px] text-red-600 mt-1">
                          Все {totalSeats} мест заняты. Бронирование недоступно
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>
              Вы уверены, что хотите удалить эту заявку?
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
              Удалить {isDeleting && <Spinner />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Modal id="contractModal" title="Впишите данные">
        <ContractForm orderId={order._id} />
      </Modal>
    </div>
  );
}
