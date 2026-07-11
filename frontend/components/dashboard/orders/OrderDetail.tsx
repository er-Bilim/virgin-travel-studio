'use client';

import OrderManageForm from '@/components/dashboard/orders/OrderManageForm';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/authHooks';
import {
  useDeleteOrder,
  useOneOrder,
  useUpdateOrder,
} from '@/lib/hooks/orderHooks';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Banknote,
  CircleCheckBig,
  Copy,
  Dot,
  Hash,
  ScrollText,
  Trash,
  User,
  UserMinus,
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
import PaymentForm from '@/components/dashboard/orders/PaymentForm';
import { cn, formatDayAndMonthWords } from '@/lib/utils';
import type { CustomOrder, StandardOrder } from '@/types/order';
import StandardOrderAside from './StandardOrderAside';
import CustomOrderAside from './CustomOrderAside';
import countries from '@/lib/countries';

export default function OrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const user = useUser().data;

  const { openModal } = useModalStore();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);

  const { data: order, isLoading, error, refetch } = useOneOrder(id as string);
  const { mutate: deleteData, isPending: isDeleting } = useDeleteOrder();
  const { mutate: updateOrder, isPending: isReleasing } = useUpdateOrder();

  const isOwnOrder = order?.managerId?._id === user?._id;
  const isRevoking = user?.role === 'ADMIN' && !isOwnOrder;

  const canRelease =
    order &&
    order.managerId &&
    (isOwnOrder || user?.role === 'ADMIN') &&
    (order.status === 'IN_PROGRESS' || order.status === 'CONTRACT_PENDING');

  const confirmDelete = () => {
    if (order) {
      deleteData(order._id, {
        onSuccess: () => {
          toast.success('Заявка успешно удалена');
          router.back();
        },
        onError: () => {
          toast.error('Ошибка при удалении');
        },
      });
    }
  };

  const confirmRelease = () => {
    if (order) {
      updateOrder(
        {
          id: order._id,
          data: {
            status: 'NEW',
            managerId: null,
          },
        },
        {
          onSuccess: () => {
            toast.success(
              isRevoking
                ? `Заявка успешно отозвана у менеджера и возвращена в общую панель заявок`
                : 'Вы успешно отказались от заявки, она возвращена в общую панель заявок',
            );
            setIsReleaseDialogOpen(false);
            router.back();
          },
          onError: () => {
            toast.error(
              isRevoking
                ? 'Не удалось отозвать заявку'
                : 'Не удалось отказаться от заявки',
            );
          },
        },
      );
    }
  };

  const paymentMethodsTranslate: Record<string, string> = {
    CASH: 'Наличные',
    CARD: 'Оплата картой',
    QR: 'QR-код',
    BANK: 'Банковский перевод',
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Загрузка заявки...</div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-[#1E2B6D] font-bold">Не удалось загрузить заявку</p>
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

  const { day, month, year } = formatDayAndMonthWords(order.createdAt);
  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Скопировано!', { duration: 3000, position: 'top-center' });
    } catch (error) {
      console.error(error);
    }
  };

  const isOrderPending: boolean = order.status === 'CONTRACT_PENDING';

  const renderOrderAside = (order: StandardOrder | CustomOrder) => {
    if (order.type === 'CUSTOM') {
      return <CustomOrderAside order={order as CustomOrder} />;
    }
    return <StandardOrderAside order={order as StandardOrder} />;
  };

  return (
    <div className="pt-4 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6 pb-6 border-b border-slate-200">
            <div>
              <Button
                onClick={() => router.back()}
                className="group mb-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-cyan-800 hover:text-[#031633] transition cursor-pointer bg-transparent p-0 w-fit"
                type="button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </Button>

              <header>
                <div className="flex flex-wrap items-center gap-1 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-800">
                    {order.type === 'STANDARD'
                      ? order.tourSetId.tourId.category.title
                      : 'Индивидуальный тур'}
                  </span>
                  <Dot className="size-5 opacity-60 text-gray-300" />
                  <Button
                    id="copyRef"
                    className="group inline-flex items-center gap-1 font-light text-[11px] text-navy-700/60 hover:text-cyan-800 transition bg-transparent cursor-pointer px-0 h-auto"
                    type="button"
                    title="скопировать ID"
                    onClick={() => handleCopy(order._id)}
                  >
                    <Hash className="size-3 opacity-60" />
                    <span>{order.visibleId}</span>
                    <Copy className="size-3 opacity-60" />
                  </Button>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-[#1E2B6D] mb-2">
                  {order.type === 'STANDARD'
                    ? order.tourSetId.tourId.title
                    : `Индивидуальный тур в ${countries.getName(order.customTour.countryCode, 'ru')}`}
                </h1>
                <p className="mt-1.5 text-navy-700/60 flex flex-wrap gap-x-2 gap-y-0.5 items-center text-xs sm:text-sm">
                  <span>
                    Заявка от{' '}
                    <span className="font-semibold text-navy-800">
                      {order.clientName}
                    </span>
                  </span>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <span>
                    Создана {day} {month} {year}
                  </span>
                  {order.managerId && (
                    <>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <span>
                        Менеджер:{' '}
                        <span className="font-semibold text-navy-800">
                          {order.managerId.fullName}
                        </span>
                      </span>
                    </>
                  )}
                </p>
              </header>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:shrink-0 mt-2 lg:mt-0">
              {canRelease && (
                <Button
                  className={cn(
                    'group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border transition text-sm font-semibold cursor-pointer',
                    isRevoking
                      ? 'border-red-200 text-red-600 bg-white hover:bg-red-50/50'
                      : 'border-amber-200 text-amber-600 bg-white hover:bg-amber-50/50',
                  )}
                  type="button"
                  onClick={() => setIsReleaseDialogOpen(true)}
                >
                  <UserMinus className="w-4 h-4 shrink-0" />
                  <span>{isRevoking ? 'Отозвать' : 'Отказаться'}</span>
                </Button>
              )}

              <button
                className={cn(
                  'group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[#031633] text-white font-semibold text-sm transition',
                  !isOrderPending
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-[#031633]/90',
                )}
                onClick={() => openModal('contractModal')}
                disabled={!isOrderPending}
              >
                <ScrollText className="size-4 text-cyan-400 shrink-0" />
                <span className="truncate">Контракт</span>
              </button>

              {user?.role === 'ADMIN' && (
                <Button
                  className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-50 transition text-sm font-semibold cursor-pointer"
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="w-4 h-4 shrink-0" />
                  <span>Удалить</span>
                </Button>
              )}

              {['CONTRACT_PENDING', 'COMPLETED'].includes(order.status) && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 h-11 rounded-xl text-white cursor-pointer shadow-sm transition-all"
                  onClick={() => openModal('paymentModal')}
                >
                  <Banknote className="w-4 h-4 mr-2" /> Фиксация оплаты
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6 w-full">
              <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <h2 className="text-sm sm:text-base font-extrabold text-navy-800 mb-4 flex items-center gap-2">
                  <User className="text-cyan-800 size-4 sm:size-5" />
                  Контакт клиента
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-100 rounded-xl p-3 sm:p-4 bg-slate-50/30">
                    <p className="text-slate-400 text-[11px] sm:text-[12px] font-semibold mb-1">
                      Имя клиента
                    </p>
                    <p className="text-navy-700 text-sm sm:text-md font-bold truncate">
                      {order.clientName}
                    </p>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-3 sm:p-4 bg-slate-50/30">
                    <p className="text-slate-400 text-[11px] sm:text-[12px] font-semibold mb-1">
                      Телефон
                    </p>
                    <p className="text-navy-700 text-sm sm:text-md font-bold tracking-wider">
                      {order.clientPhone}
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                  <h2 className="text-sm sm:text-base font-extrabold text-navy-800 flex items-center gap-2">
                    <CircleCheckBig className="text-cyan-800 size-4 sm:size-5" />
                    Статус заявки
                  </h2>
                  <span
                    id="statusBadge"
                    className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-bold bg-slate-100 text-cyan-800"
                  >
                    {ORDER_STATUS_LABELS[
                      order.status as keyof typeof ORDER_STATUS_LABELS
                    ] || order.status}
                  </span>
                </div>

                {order.paymentMethod && order.paymentAmount !== undefined && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-emerald-800">
                        Информация об оплате
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-emerald-900 text-sm sm:text-base">
                      <p>
                        Способ оплаты:{' '}
                        <span className="font-bold">
                          {paymentMethodsTranslate[order.paymentMethod] ||
                            order.paymentMethod}
                        </span>
                      </p>
                      <p>
                        Внесенная сумма:{' '}
                        <span className="font-bold">
                          {order.paymentAmount.toLocaleString('ru-RU')}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <OrderManageForm
                  initialValues={{
                    tourSetId:
                      order.type === 'STANDARD'
                        ? order.tourSetId._id
                        : order.customTour._id,
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

            {renderOrderAside(order)}
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-left text-base sm:text-lg">
              Вы уверены, что хотите удалить эту заявку?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto rounded-xl"
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto rounded-xl"
            >
              Удалить {isDeleting && <Spinner />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-left text-base sm:text-lg">
              {isRevoking
                ? 'Вы уверены, что хотите отозвать эту заявку?'
                : 'Вы уверены, что хотите отказаться от этой заявки?'}
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-left leading-relaxed">
              {isRevoking
                ? `Заявка будет принудительно изъята у менеджера (${order.managerId?.fullName}) и вернется в общую панель со статусом «Новая».`
                : 'Она будет убрана из вашего списка и вернется в общую панель заявок со статусом «Новая».'}
            </p>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReleaseDialogOpen(false)}
              className="w-full sm:w-auto rounded-xl"
            >
              Отмена
            </Button>
            <Button
              onClick={confirmRelease}
              disabled={isReleasing}
              className={cn(
                'w-full sm:w-auto text-white font-semibold rounded-xl transition',
                isRevoking
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700',
              )}
            >
              {isRevoking ? 'Отозвать' : 'Отказаться'}{' '}
              {isReleasing && <Spinner />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Modal id="contractModal" title="Впишите данные">
        <ContractForm orderId={order._id} />
      </Modal>

      <Modal id="paymentModal" title="Фиксация оплаты">
        <PaymentForm orderId={order._id} />
      </Modal>
    </div>
  );
}
