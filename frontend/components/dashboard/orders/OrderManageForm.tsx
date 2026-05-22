'use client';

import { useForm, Controller } from 'react-hook-form';
import type { OrderMutationType } from '@/types/order';
import { inputClass } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateOrder } from '@/lib/hooks/orderHooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  initialValues: OrderMutationType;
  orderId?: string;
}

export default function OrderManageForm({ initialValues, orderId }: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch, 
    formState: { errors },
  } = useForm<OrderMutationType>({ defaultValues: initialValues });

  const router = useRouter();
  const { mutate: updateOrder, isPending: isUpdatinging } = useUpdateOrder();

  const currentStatus = watch('status');

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
      },
    );
  };

  const statusList = [
    'NEW',
    'IN_PROGRESS',
    'CONTRACT_PENDING',
    'COMPLETED',
    'REJECTED',
  ];

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
            rules={{ required: 'Статус' }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className={`${inputClass} ${errors.status ? 'border-red-500 focus:ring-red-500' : ''}`}
                >
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  {statusList?.map((status, index) => (
                    <SelectItem key={index} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.status.message}
            </p>
          )}
        </div>

        {currentStatus === 'REJECTED' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Причина отказа
            </label>
            <Input
              {...register('rejectionReason', {
                required:
                  currentStatus === 'REJECTED'
                    ? 'Введите причину отказа'
                    : false,
              })}
              className={`${inputClass} ${errors.rejectionReason ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.rejectionReason && (
              <p className="text-xs font-semibold text-red-500 pt-0.5">
                {errors.rejectionReason.message}
              </p>
            )}
          </div>
        )}
        <Button
          type="submit"
        >
          Сохранить
        </Button>
      </div>
    </form>
  );
}
