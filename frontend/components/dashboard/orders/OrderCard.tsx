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
import { useForm, SubmitHandler } from "react-hook-form";
import { OrderType } from "@/types/order";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  tourId: string | null;
}


export function OrderCard({ isOpen, onClose, tourId }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderType>({
    defaultValues: {
        clientName: "",
        phone: "",
    }
  });


  const onSubmit: SubmitHandler<OrderType> = (data) => {
    // здесь отправка заявки на тур
    if (tourId) {
      console.log(tourId);
      console.log("отправка заявки", data);

      toast.success("Заявка оставлена", { position: "top-center" });
    }
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
              <Label htmlFor="email">Имя:</Label>
              <Input
                id="clientName"
                type="text"
                placeholder="Алёша"
                {...register("clientName", {
                  required: true,
                  validate: (value) => {
                    return (
                      !!value.trim() ||
                      "Поле не может состоять только из пробелов"
                    );
                  },
                })}
              />
              {errors.clientName && <span>{errors.clientName.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Телефон:</Label>
              <Input
                id="phone"
                type="number"
                placeholder="+996"
                {...register("phone", {
                  required: true,
                  validate: (value) => {
                    return (
                      !!value.trim() ||
                      "Поле не может состоять только из пробелов"
                    );
                  },
                })}
              />
              {errors.phone && <span>{errors.phone.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Оставть заявку
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
