'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { formatDayAndMonthWords, formatToReadablePrice } from '@/lib/utils';
import { X } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { isValidPhoneNumber, AsYouType } from 'libphonenumber-js';

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
    const cleanedData = {
      ...data,
      clientPhone: data.clientPhone.replace(/[\s()-]/g, ''),
    };

    postOrder(cleanedData, {
      onSuccess: () => {
        onClose();
        toast.success(
          'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время',
          { position: 'top-center' },
        );
      },
    });
  };

  const priceInfo = formatToReadablePrice(price);

  const { day: startDay, month: startMonth } =
    formatDayAndMonthWords(startDate);
  const { day: endDay, month: endMonth } = formatDayAndMonthWords(endDate);

  const normalizePhone = (value: string) => {
    const cleaned = value.replace(/[\s()-]/g, '');
    if (!cleaned) return cleaned;
    return cleaned.startsWith('+')
      ? cleaned
      : `+996${cleaned.replace(/^0/, '')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="overflow-hidden p-0 max-w-[92vw] sm:max-w-[440px] rounded-2xl border-0 shadow-xl [&>button]:hidden"
        aria-describedby={undefined}
      >
        <DialogHeader className="bg-[var(--navy-700)] p-5 sm:p-6 text-left relative">
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Закрыть"
              className="absolute right-4 top-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 focus:outline-none"
            >
              <X className="size-4" />
            </button>
          </DialogClose>
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Оставить заявку
          </p>
          <DialogTitle className="mt-1.5 pr-6 text-base sm:text-[17px] font-bold leading-snug text-white">
            {tourTitle}
          </DialogTitle>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar1 className="size-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold text-white">
                {startDay} {startMonth} — {endDay} {endMonth}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
              <Tag className="size-3.5 text-cyan-400 shrink-0" />
              <strong className="font-bold text-white">
                {priceInfo.price} {priceInfo.currency}
              </strong>
            </span>
          </div>
        </DialogHeader>

        <DialogDescription className="sr-only">
          Пожалуйста, заполните форму ниже для продолжения.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 bg-white">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label
                htmlFor="clientName"
                className="text-xs font-bold text-slate-500 uppercase tracking-wide"
              >
                Ваше имя
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Как к вам обращаться"
                  className={cn(
                    'pl-10 h-11 rounded-xl focus-visible:ring-[#031633] border-border',
                    errors.clientName &&
                      'border-red-500 focus-visible:ring-red-500',
                  )}
                  {...register('clientName', {
                    required: 'Поле обязательно',
                    validate: (value) =>
                      !!value.trim() ||
                      'Поле не может состоять только из пробелов',
                  })}
                />
              </div>
              {errors.clientName && (
                <span className="text-[11px] font-semibold text-red-500 pl-1">
                  {errors.clientName.message}
                </span>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="phone"
                className="text-xs font-bold text-slate-500 uppercase tracking-wide"
              >
                Телефон
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="phone"
                  type="tel"
                  placeholder="+996 ___ ___ ___"
                  className={cn(
                    'pl-10 h-11 rounded-xl focus-visible:ring-[#031633] border-border',
                    errors.clientPhone &&
                      'border-red-500 focus-visible:ring-red-500',
                  )}
                  {...register('clientPhone', {
                    onChange: (event) => {
                      const digits = event.target.value.replace(/[^\d+]/g, '');
                      event.target.value = new AsYouType().input(digits);
                    },
                    required: 'Поле обязательно',
                    setValueAs: normalizePhone,
                    validate: (value) => {
                      return (
                        isValidPhoneNumber(value) ||
                        'Введите корректный номер телефона, например +996 123 456 789'
                      );
                    },
                  })}
                />
              </div>
              {errors.clientPhone && (
                <span className="text-[11px] font-semibold text-red-500 pl-1">
                  {errors.clientPhone.message}
                </span>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Номер любой страны в международном формате: +996, +7, +90…
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[#031633] text-white py-5 h-12 rounded-xl text-sm font-bold hover:bg-[#031633]/90 transition active:scale-[0.99] shadow-sm"
          >
            <Send className="size-4 text-cyan-400" />
            Отправить заявку
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
            <ShieldCheck className="size-4 text-emerald-500" />
            Менеджер свяжется с вами в течение часа
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCard;
