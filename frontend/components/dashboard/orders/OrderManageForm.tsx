'use client';

import { useForm, Controller } from 'react-hook-form';
import type { OrderMutationType } from '@/types/order';
import { inputClass, ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { useUpdateOrder } from '@/lib/hooks/orderHooks';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Check, CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  initialValues: OrderMutationType;
  orderId?: string;
}

export default function OrderManageForm({ initialValues, orderId }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OrderMutationType>({ defaultValues: initialValues });

  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = (data: OrderMutationType) => {
    if (!orderId) return;

    const payload = {
      ...data,
      rejectionReason: data.status === 'REJECTED' ? data.rejectionReason : '',
    };

    updateOrder(
      { id: orderId, data: payload },
      {
        onSuccess: () => {
          toast.success('Заявка обновлена', { position: 'top-center' });
        },
      },
    );
  };

  const rejectStatus = 'REJECTED';

  if (isUpdating) {
    return <div className="p-8 text-center text-gray-500">Обновляется...</div>;
  }

  const statusText = ORDER_STATUS_FLOW.map((status) => ({ status, text: ORDER_STATUS_LABELS[status] }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      <div className="space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Клиент</label>
            <Input
              {...register('clientName', { required: 'Введите имя клиента' })}
              className={`${inputClass} ${errors.clientName ? 'border-red-500 focus-visible:ring-red-500' : ''} rounded-xl h-11`}
            />
            {errors.clientName && <p className="text-[11px] font-semibold text-red-500">{errors.clientName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Телефон</label>
            <Input
              {...register('clientPhone', { required: 'Введите телефон клиента' })}
              className={`${inputClass} ${errors.clientPhone ? 'border-red-500 focus-visible:ring-red-500' : ''} rounded-xl h-11`}
            />
            {errors.clientPhone && <p className="text-[11px] font-semibold text-red-500">{errors.clientPhone.message}</p>}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Статус заявки</label>

          <Controller
            control={control}
            name="status"
            render={({ field }) => {
              const currentStepIndex = statusText && field.value ? statusText.findIndex((item) => item.status === field.value) : -1;
              const isCurrentlyRejected = field.value === rejectStatus;

              return (
                <div className="w-full">
                  <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-2 w-full bg-slate-50/60 p-2 rounded-2xl border border-slate-100">
                    {statusText?.map((status, index) => {
                      const isCompleted = !isCurrentlyRejected && index < currentStepIndex;
                      const isActive = !isCurrentlyRejected && index === currentStepIndex;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => field.onChange(status.status)}
                          className={cn(
                            "flex items-center gap-2 w-full p-2.5 rounded-xl border text-left transition-all h-full min-h-[48px] select-none cursor-pointer",
                            isActive && "border-cyan-600 bg-cyan-600 text-white shadow-sm font-bold",
                            isCompleted && "border-emerald-100 bg-emerald-50/50 text-emerald-800 font-medium",
                            !isActive && !isCompleted && "border-slate-200 bg-white text-slate-500 hover:bg-slate-100/70"
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center size-5.5 rounded-full text-[10px] font-black shrink-0 transition-all",
                              isActive && "bg-white text-cyan-600",
                              isCompleted && "bg-emerald-600 text-white",
                              !isActive && !isCompleted && "bg-slate-100 text-slate-400"
                            )}
                          >
                            {isCompleted ? <Check className="size-3 stroke-[3]" /> : index + 1}
                          </div>

                          <span
                            className={cn(
                              'text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-tight whitespace-normal break-words flex-1 min-w-0',
                              isActive ? 'text-white' : isCompleted ? 'text-emerald-900' : 'text-slate-600'
                            )}
                          >
                            {status.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-[12px] text-slate-400 max-w-md leading-relaxed">
                      Если заявку нельзя выполнить по какой-либо причине — отклоните её с указанием обязательного комментария для истории.
                    </p>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-50 transition text-xs font-bold cursor-pointer w-full sm:w-auto shrink-0 shadow-sm"
                      onClick={() => {
                        setIsModalOpen(true);
                        field.onChange(rejectStatus);
                      }}
                    >
                      <CircleX className="size-4" />
                      Отклонить заявку
                    </button>
                  </div>
                </div>
              );
            }}
          />
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Причина отказа</label>
          <Input
            {...register('rejectionReason', { disabled: true })}
            className={`${inputClass} font-semibold bg-slate-50 border-slate-100 rounded-xl h-11 text-sm text-red-600/90`}
          />
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end">
        <Button
          type="submit"
          className="w-full sm:w-auto h-11 px-6 rounded-xl bg-navy-800 text-white font-semibold hover:bg-navy-900 transition shadow-sm cursor-pointer text-sm"
        >
          Сохранить изменения
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[425px] rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base sm:text-lg">Укажите причину отмены заявки</DialogTitle>
            <div className="mt-3">
              <Input
                {...register('rejectionReason')}
                placeholder="Например: Клиент передумал лететь..."
                className={`${inputClass} ${errors.rejectionReason ? 'border-red-500 focus-visible:ring-red-500' : ''} rounded-xl h-11 text-sm`}
              />
              {errors.rejectionReason && (
                <p className="text-xs font-semibold text-red-500 pt-1">{errors.rejectionReason.message}</p>
              )}
            </div>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setValue('status', 'IN_PROGRESS');
                setIsModalOpen(false);
              }}
              className="w-full sm:w-auto rounded-xl"
            >
              Назад
            </Button>
            <Button variant="destructive" type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto rounded-xl">
              Подтвердить отмену
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}