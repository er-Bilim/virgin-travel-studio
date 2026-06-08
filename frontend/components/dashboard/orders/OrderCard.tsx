'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { OrderPostType } from '@/types/order';
import { useCreateOrder } from '@/lib/hooks/orderHooks';
import { Calendar1, Tag, User, Phone, Send, ShieldCheck } from 'lucide-react';
import {
  formatDayAndMonthWords,
  formatToReadablePrice,
} from '@/lib/utils';
import { X } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tourSetId: string;
  tourTitle: string;
  startDate: string;
  endDate: string;
  price: number;
}

const OrderCard = ({
  isOpen,
  onClose,
  tourSetId,
  tourTitle,
  startDate,
  endDate,
  price,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderPostType>({
    defaultValues: {
      tourSetId: tourSetId,
      clientName: '',
      clientPhone: '',
    },
  });

  const { mutate: postOrder } = useCreateOrder();

  const onSubmit: SubmitHandler<OrderPostType> = (data) => {
    postOrder(data, {
      onSuccess: () => {
        onClose();
        toast.success(
          'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время',
          { position: 'top-center' },
        );
      },
      onError: () => {
        toast.error('Ошибка на стороне сервера, попробуйте позже', {
          position: 'top-center',
        });
      },
    });
  };

  const priceInfo = formatToReadablePrice(price);

  const { day: startDay, month: startMonth } = formatDayAndMonthWords(
    startDate,
  );

  const { day: endDay, month: endMonth } = formatDayAndMonthWords(
    endDate,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-[440px] [&>button]:hidden"
        aria-describedby={undefined}
      >
        <DialogHeader className="bg-[var(--navy-700)] p-6 text-left">
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Закрыть"
              className="absolute right-4 top-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
            >
              <X className="size-4" />
            </button>
          </DialogClose>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-400">
            Оставить заявку
          </p>
          <DialogTitle className="mt-2 pr-8 text-[17px] font-bold leading-snug text-white">
            {tourTitle}
          </DialogTitle>
          <div className="mt-3 flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--silver)]">
              <Calendar1 className="size-3.5 text-cyan-400" />
              <p className="font-semibold text-white">
                <span className="after:content-['–'] after:ml-2">{startDay} {startMonth}</span>

                <span className="ms-2">{endDay} {endMonth}</span>
              </p>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--silver)]">
              <Tag className="size-3.5 text-cyan-400" />
              <strong className="font-semibold text-white">
                {priceInfo.price} {priceInfo.currency}
              </strong>
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Ваше имя</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Как к вам обращаться"
                  className="pl-10"
                  {...register('clientName', {
                    required: 'Поле обязательно',
                    validate: (value) =>
                      !!value.trim() ||
                      'Поле не может состоять только из пробелов',
                  })}
                />
              </div>
              {errors.clientName && (
                <span className="text-xs text-red-500">
                  {errors.clientName.message}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+996 ___ ___ ___"
                  className="pl-10"
                  {...register('clientPhone', {
                    required: 'Поле обязательно',
                    setValueAs: (v: string) => v.replace(/[\s()-]/g, ''),
                    pattern: {
                      value: /^\+?[0-9]{9,15}$/,
                      message: 'Введите корректный номер телефона',
                    },
                  })}
                />
              </div>
              {errors.clientPhone && (
                <span className="text-xs text-red-500">
                  {errors.clientPhone.message}
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[var(--primary)] py-6 text-base font-semibold hover:bg-[var(--primary)]/90"
          >
            <Send className="size-4 text-cyan-400" />
            Отправить заявку
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="size-4 text-[var(--ring)]" />
            Менеджер свяжется с вами в течение часа
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCard;
