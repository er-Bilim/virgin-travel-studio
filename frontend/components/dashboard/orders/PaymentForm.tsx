'use client';
import {Controller, useForm} from 'react-hook-form';
import {Save} from 'lucide-react';
import {Spinner} from '@/components/ui/spinner';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useModalStore} from '@/lib/stores/modalStore';
import {useUpdateOrder} from '@/lib/hooks/orderHooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useUser} from "@/lib/hooks/authHooks";

export interface PaymentFormValues {
  paymentMethod: 'CASH' | 'CARD' | 'QR' | 'BANK';
  paymentAmount: number;
}

interface Props {
  orderId: string;
}

const PaymentForm: React.FC<Props> = ({ orderId }) => {
  const { closeModal } = useModalStore();
  const { mutate: updateOrder, isPending } = useUpdateOrder();
  const {data: user} = useUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    defaultValues: {
      paymentMethod: 'CASH',
      paymentAmount: undefined,
    },
  });

  const handleSubmitForm = (data: PaymentFormValues) => {
    updateOrder(
      {
        id: orderId,
        data: {
          managerId: user?._id,
          paymentMethod: data.paymentMethod,
          paymentAmount: data.paymentAmount
        }
      },
      {
        onSuccess: () => {
          reset();
          closeModal();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4 pt-2">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Способ оплаты
          </label>
          <Controller
            name="paymentMethod"
            control={control}
            rules={{ required: 'Выберите способ оплаты' }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <SelectTrigger className="w-full bg-white border-gray-300">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="CASH">Наличные</SelectItem>
                  <SelectItem value="CARD">Оплата картой</SelectItem>
                  <SelectItem value="QR">QR-код</SelectItem>
                  <SelectItem value="BANK">Банковский перевод</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.paymentMethod && (
            <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="paymentAmount" className="text-sm font-medium text-gray-700">
            Сумма оплаты
          </label>
          <Input
            id="paymentAmount"
            type="number"
            {...register('paymentAmount', {
              required: 'Введите сумму',
              valueAsNumber: true,
              min: {
                value: 1,
                message: 'Сумма должна быть больше 0',
              },
            })}
            className="w-full bg-white border-gray-300"
            placeholder="Например: 50000"
            disabled={isPending}
          />
          {errors.paymentAmount && (
            <p className="text-sm text-red-500">{errors.paymentAmount.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all w-full md:w-auto"
        >
          {!isPending ? (
            <>
              <Save className="w-4 h-4 mr-2" /> Сохранить оплату
            </>
          ) : (
            <Spinner />
          )}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;