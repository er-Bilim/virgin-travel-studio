'use client';

import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format, formatDate } from 'date-fns';
import { usePathname } from 'next/navigation';
import { ru } from 'date-fns/locale';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { inputClass } from '@/lib/constants';
import type { TourSetMutation } from '@/types/tourSets';
import { cn } from '@/lib/utils';
import { useCreateTourSet, useUpdateTourSet } from '@/lib/hooks/tourSets';

interface Props {
  isEdit?: boolean;
  initialValues?: Partial<TourSetMutation>;
  tourSetId?: string;
  parentTourId: string;
}

export const TourSetForm = ({
  isEdit = false,
  initialValues,
  tourSetId,
  parentTourId,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const dashboardBase = pathname.startsWith('/admin') ? '/admin' : '/manager';

  const { mutate: createTourSet, isPending: isCreating } = useCreateTourSet();
  const { mutate: updateTourSet, isPending: isUpdating } = useUpdateTourSet();

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<TourSetMutation>({
    defaultValues: initialValues || {
      tourId: parentTourId,
      startDate: '',
      endDate: '',
      price: 0,
      discountPrice: undefined,
      hotelName: '',
      hotelLocation: '',
      airline: '',
      flightDetails: '',
      totalSeats: 20,
      isHot: false,
      saleDeadline: '',
      status: 'OPEN',
    },
  });

  const startDateValue = watch('startDate');

  const onSubmit = (data: TourSetMutation) => {
    const isActionActive =
      data.isHot || (data.discountPrice && Number(data.discountPrice) > 0);

    const formattedData = {
      ...data,
      tourId: parentTourId,
      startDate: data.startDate
        ? formatDate(new Date(data.startDate), 'yyyy-MM-dd')
        : '',
      endDate: data.endDate
        ? formatDate(new Date(data.endDate), 'yyyy-MM-dd')
        : '',
      price: Number(data.price),
      discountPrice: data.discountPrice
        ? Number(data.discountPrice)
        : undefined,
      totalSeats: Number(data.totalSeats),
      saleDeadline:
        isActionActive && data.saleDeadline
          ? new Date(data.saleDeadline).toISOString()
          : undefined,
    };

    if (!isEdit) {
      createTourSet(formattedData, {
        onSuccess: () => {
          reset();
          router.push(`${dashboardBase}/tours/${parentTourId}`);
        },
      });
    } else {
      if (!tourSetId) return;

      updateTourSet(
        { id: tourSetId, data: formattedData },
        {
          onSuccess: () => {
            router.push(`${dashboardBase}/tours/${parentTourId}`);
          },
        },
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold text-[#1E2B6D]">
        {isEdit ? 'Редактирование потока' : 'Добавление потока'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Дата начала
          </label>
          <Controller
            control={control}
            name="startDate"
            rules={{ required: 'Укажите дату начала' }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isPending}
                    className={cn(
                      'w-full justify-start text-left font-normal border-gray-200 shadow-none hover:bg-gray-50',
                      inputClass,
                      !field.value && 'text-muted-foreground',
                      errors.startDate && 'border-red-500 focus:ring-red-500',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {field.value ? (
                      format(new Date(field.value), 'PPP', { locale: ru })
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange((date as Date | undefined)?.toISOString())
                    }
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.startDate && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-1 flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Дата окончания
          </label>
          <Controller
            control={control}
            name="endDate"
            rules={{
              required: 'Укажите дату окончания',
              validate: (value) => {
                if (!startDateValue) return true;
                return (
                  new Date(value) > new Date(startDateValue) ||
                  'Дата окончания должна быть позже даты начала'
                );
              },
            }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isPending}
                    className={cn(
                      'w-full justify-start text-left font-normal border-gray-200 shadow-none hover:bg-gray-50',
                      inputClass,
                      !field.value && 'text-muted-foreground',
                      errors.endDate && 'border-red-500 focus:ring-red-500',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {field.value ? (
                      format(new Date(field.value), 'PPP', { locale: ru })
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange((date as Date | undefined)?.toISOString())
                    }
                    disabled={(date) =>
                      startDateValue
                        ? date <= new Date(startDateValue)
                        : date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.endDate && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Название отеля
          </label>
          <Input
            {...register('hotelName', { required: 'Введите название отеля' })}
            className={`${inputClass} ${errors.hotelName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isPending}
            placeholder="Например: Hilton Resort"
          />
          {errors.hotelName && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.hotelName.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Локация отеля
          </label>
          <Input
            {...register('hotelLocation', {
              required: 'Укажите локацию отеля',
            })}
            className={`${inputClass} ${errors.hotelLocation ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isPending}
            placeholder="Например: Египет, Шарм-эш-Шейх"
          />
          {errors.hotelLocation && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.hotelLocation.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Основная цена (KGS)
          </label>
          <Input
            type="number"
            {...register('price', {
              required: 'Укажите цену',
              min: { value: 0, message: 'Цена не может быть отрицательной' },
            })}
            className={`${inputClass} ${errors.price ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isPending}
          />
          {errors.price && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Акционная цена (опционально)
          </label>
          <Input
            type="number"
            {...register('discountPrice', {
              validate: (value) => {
                if (!value) return true;
                const basePrice = Number(watch('price'));
                if (Number(value) < 0) {
                  return 'Скидочная цена не может быть отрицательной';
                }
                return (
                  Number(value) < basePrice ||
                  'Скидочная цена должна быть меньше основной'
                );
              },
            })}
            className={`${inputClass} ${errors.discountPrice ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isPending}
          />
          {errors.discountPrice && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {errors.discountPrice.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Авиакомпания (опционально)
          </label>
          <Input
            {...register('airline')}
            className={inputClass}
            disabled={isPending}
            placeholder="Например: Turkish Airlines"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Детали рейса (опционально)
          </label>
          <Input
            {...register('flightDetails')}
            className={inputClass}
            disabled={isPending}
            placeholder="Рейс TK-211, Вылет в 14:00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Всего мест
          </label>
          <Input
            type="number"
            {...register('totalSeats', {
              required: 'Укажите количество мест',
              min: 1,
            })}
            className={inputClass}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center h-10 px-1">
          <Controller
            control={control}
            name="isHot"
            render={({ field }) => (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <Checkbox
                  id="isHot"
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="data-[state=checked]:bg-[#1E2B6D] data-[state=checked]:border-[#1E2B6D] border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Горящий поток
                </span>
              </label>
            )}
          />
        </div>

        <div className="space-y-1 flex flex-col">
          <label
            className={cn(
              'text-sm font-medium mb-1 transition-colors',
              watch('isHot') || watch('discountPrice')
                ? 'text-gray-700'
                : 'text-gray-400',
            )}
          >
            Дедлайн акции
          </label>
          <Controller
            control={control}
            name="saleDeadline"
            render={({ field }) => {
              const selectedValue = field.value
                ? new Date(field.value)
                : undefined;
              const isAvailable =
                watch('isHot') ||
                (watch('discountPrice') && Number(watch('discountPrice')) > 0);

              const handleDateSelect = (date: Date | undefined) => {
                if (!date) return;
                const baseDate = selectedValue || new Date();
                date.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);
                field.onChange(date.toISOString());
              };

              const handleTimeChange = (
                type: 'hour' | 'minute',
                value: string,
              ) => {
                const baseDate = selectedValue || new Date();
                const newDate = new Date(baseDate);

                if (type === 'hour') {
                  newDate.setHours(parseInt(value, 10));
                } else if (type === 'minute') {
                  newDate.setMinutes(parseInt(value, 10));
                }

                field.onChange(newDate.toISOString());
              };

              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isPending || !isAvailable}
                      className={cn(
                        'w-full justify-start text-left font-normal border-gray-200 shadow-none hover:bg-gray-50',
                        inputClass,
                        !field.value && 'text-muted-foreground',
                        !isAvailable &&
                          'bg-gray-50 opacity-60 cursor-not-allowed',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                      {field.value && isAvailable ? (
                        format(new Date(field.value), 'PP в HH:mm', {
                          locale: ru,
                        })
                      ) : (
                        <span>
                          {isAvailable
                            ? 'Выберите дедлайн'
                            : 'Сначала укажите акцию'}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="sm:flex">
                      <Calendar
                        mode="single"
                        selected={selectedValue}
                        onSelect={(date) =>
                          handleDateSelect(date as Date | undefined)
                        }
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                      <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x border-t sm:border-t-0 border-gray-100 bg-gray-50/50">
                        <ScrollArea className="w-64 sm:w-auto">
                          <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 24 }, (_, i) => i).map(
                              (hour) => {
                                const hourStr = hour
                                  .toString()
                                  .padStart(2, '0');
                                const isSelected =
                                  selectedValue &&
                                  selectedValue.getHours() === hour;
                                return (
                                  <Button
                                    key={hour}
                                    type="button"
                                    size="icon"
                                    variant={isSelected ? 'default' : 'ghost'}
                                    className={cn(
                                      'sm:w-10 h-8 shrink-0 text-xs font-medium',
                                      isSelected &&
                                        'bg-[#1E2B6D] hover:bg-[#1E2B6D] text-white',
                                    )}
                                    onClick={() =>
                                      handleTimeChange('hour', hour.toString())
                                    }
                                  >
                                    {hourStr}
                                  </Button>
                                );
                              },
                            )}
                          </div>
                          <ScrollBar
                            orientation="horizontal"
                            className="sm:hidden"
                          />
                        </ScrollArea>

                        <ScrollArea className="w-64 sm:w-auto">
                          <div className="flex sm:flex-col p-2">
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(
                              (minute) => {
                                const minStr = minute
                                  .toString()
                                  .padStart(2, '0');
                                const isSelected =
                                  selectedValue &&
                                  selectedValue.getMinutes() === minute;
                                return (
                                  <Button
                                    key={minute}
                                    type="button"
                                    size="icon"
                                    variant={isSelected ? 'default' : 'ghost'}
                                    className={cn(
                                      'sm:w-10 h-8 shrink-0 text-xs font-medium',
                                      isSelected &&
                                        'bg-[#1E2B6D] hover:bg-[#1E2B6D] text-white',
                                    )}
                                    onClick={() =>
                                      handleTimeChange(
                                        'minute',
                                        minute.toString(),
                                      )
                                    }
                                  >
                                    {minStr}
                                  </Button>
                                );
                              },
                            )}
                          </div>
                          <ScrollBar
                            orientation="horizontal"
                            className="sm:hidden"
                          />
                        </ScrollArea>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }}
          />
        </div>
      </div>

      {isEdit && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Статус потока
          </label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isPending}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">
                    Открыт для бронирования (OPEN)
                  </SelectItem>
                  <SelectItem value="CLOSED">
                    Мест нет / Закрыт (CLOSED)
                  </SelectItem>
                  <SelectItem value="FINISHED">Завершен (FINISHED)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center rounded-2xl bg-[#1E2B6D] px-4 py-3 font-semibold text-white transition hover:bg-[#162356] disabled:opacity-50 h-12"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Сохранение...
          </span>
        ) : isEdit ? (
          'Сохранить изменения потока'
        ) : (
          'Создать поток'
        )}
      </button>
    </form>
  );
};
