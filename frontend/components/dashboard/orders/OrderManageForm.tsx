'use client';

import { useForm, Controller } from 'react-hook-form';
import type { OrderMutationType } from '@/types/order';
import { inputClass } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { useUpdateOrder } from '@/lib/hooks/orderHooks';
import { useRouter } from 'next/navigation';
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
import { Check } from 'lucide-react';
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

  const router = useRouter();
  const { mutate: updateOrder, isPending: isUpdatinging } = useUpdateOrder();

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
          router.back();
        },
        onError: () => {
          toast.error('Произошла ошибка', { position: 'top-center' });
        },
      },
    );
  };

  const statusText = [
    { status: 'NEW', text: 'Новый' },
    { status: 'IN_PROGRESS', text: 'В работе' },
    { status: 'CONTRACT_PENDING', text: 'Договор' },
    { status: 'COMPLETED', text: 'Завершена' },
  ];

  const rejectStatus = 'REJECTED';

  if (isUpdatinging) {
    return <div className="p-8 text-center text-gray-500">Обновляется...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 items-start"
    >
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Клиент</label>
          <Input
            {...register('clientName', { required: 'Введите имя клиента' })}
            className={`${inputClass} ${errors.clientName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {errors.clientName && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.clientName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Телефон</label>
          <Input
            {...register('clientPhone', {
              required: 'Введите телефон клиента',
            })}
            className={`${inputClass} ${errors.clientPhone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {errors.clientPhone && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.clientPhone.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Статус</label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => {
              const currentStepIndex =
                statusText && field.value
                  ? statusText.findIndex((item) => item.status === field.value)
                  : -1;
              const isCurrentlyRejected = field.value === rejectStatus;

              return (
                <div className="flex flex-col space-y-2 w-full py-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-medium text-gray-500">
                      Этап заявки
                    </span>
                    {errors.status && (
                      <span className="text-xs text-red-500">
                        {errors.status.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row items-start lg:items-center lg:gap-2 relative w-full p-4 rounded-xl">
                    {statusText?.map((status, index) => {
                      const isCompleted =
                        !isCurrentlyRejected && index < currentStepIndex;
                      const isActive =
                        !isCurrentlyRejected && index === currentStepIndex;

                      return (
                        <div
                          key={index}
                          className="flex items-center w-full lg:w-auto"
                        >
                          <button
                            type="button"
                            onClick={() => field.onChange(status.status)}
                            className="flex flex-col items-start space-x-3 lg:space-x-2 group w-full lg:w-auto transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex flex-row gap-2 items-center">
                              <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold shrink-0 transition-all
                                ${isActive ? 'bg-white border-cyan-500 text-cyan-500' : ''}
                                ${isCompleted ? 'bg-cyan-600 border-cyan-600 text-white' : ''}
                                ${!isActive && !isCompleted ? ' border-slate-100 bg-slate-100 text-gray-400 group-hover:border-gray-400' : ''}
                      `}
                              >
                                {isCompleted ? (
                                  <Check className="size-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>

                              {
                                index < statusText.length - 1 && (
                                  <span className='h-0.5 text-slate-100 bg-red-300 w-[85px] rounded-2xl'/>
                                )
                              }
                            </div>

                            <div className="flex flex-col">
                              <span
                                className={cn(
                                  'mt-3 text-[12px] font-bold uppercase tracking-wide step-label transition',
                                  {
                                    'text-gray-400': !isActive && !isCompleted,
                                    'text-cyan-600 font-bold': isActive,
                                  },
                                )}
                              >
                                {status.text}
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })}

                    {/*<button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(true);
                        field.onChange(rejectStatus);
                      }}
                      className="flex items-center space-x-3 lg:space-x-2 text-left group w-full lg:w-auto transition-all duration-200"
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold shrink-0 transition-all
                ${isCurrentlyRejected ? 'bg-red-500 border-red-500 text-white ring-4 ring-red-100' : 'bg-white border-red-200 text-red-400 group-hover:border-red-400 group-hover:text-red-500'}
              `}
                      >
                        {isCurrentlyRejected ? '✕' : '✕'}
                      </div>

                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium transition-colors
                  ${isCurrentlyRejected ? 'text-red-600 font-bold' : 'text-red-400 group-hover:text-red-500'}
                `}
                        >
                          {rejectStatus}
                        </span>
                      </div>
                    </button>*/}
                  </div>
                </div>
              );
            }}
          />
          {errors.status && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.status.message}
            </p>
          )}

          <label className="text-sm font-bold text-gray-700">
            Причина отказа
          </label>
          <Input
            {...register('rejectionReason', { disabled: true })}
            className={`${inputClass} font-black`}
          />
        </div>
        <Button type="submit">Сохранить</Button>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>Какая причина отмены заявки?</DialogTitle>
            <Input
              {...register('rejectionReason')}
              className={`${inputClass} ${errors.rejectionReason ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.rejectionReason && (
              <p className="text-xs font-semibold text-red-500 pt-0.5">
                {errors.rejectionReason.message}
              </p>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setValue('status', 'IN_PROGRESS');
                setIsModalOpen(false);
              }}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={() => setIsModalOpen(false)}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
