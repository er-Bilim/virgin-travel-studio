'use client'
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { OrderType } from "@/types/order";
import { useCreateOrder } from "@/lib/hooks/orderHooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tourSetId: string;
}


export function OrderCard({ isOpen, onClose, tourSetId }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderType>({
    defaultValues: {
      tourSetId: tourSetId,
      clientName: '',
      clientPhone: '',
    },
  });

  const {mutate: postOrder } = useCreateOrder();

  const onSubmit: SubmitHandler<OrderType> = (data) => {
      postOrder(data, {
        onSuccess: () => {
          onClose();
          toast.success(
            'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время',
            { position: 'top-center' },
          );
        },
        onError: () => {
          toast.error('Ошибка на стороне сервера, попробуйте позже', { position: 'top-center' });
        }
      })
    
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Оставьте контактные данные</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Имя:</Label>
              <Input
                id="clientName"
                type="text"
                placeholder="Алёша"
                {...register('clientName', {
                  required: 'Поле обязательно',
                  validate: (value) => {
                    return (
                      !!value.trim() ||
                      'Поле не может состоять только из пробелов'
                    );
                  },
                })}
              />
              {errors.clientName && <span>{errors.clientName.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон:</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0550182430"
                {...register('clientPhone', {
                  required: 'Поле обязательно',
                })}
              />
              {errors.clientPhone && <span>{errors.clientPhone.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Оставить заявку
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
