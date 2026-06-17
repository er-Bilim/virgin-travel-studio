'use client';

import { useCreateOrder } from '@/lib/hooks/orderHooks';
import type { CustomTourMutation, CustomTourPost } from '@/types/order';
import {
  Calendar1,
  Hotel,
  MapPinned,
  Phone,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  clientNameRule,
  countryCodeRule,
  endDateRule,
  startDateRule,
  clientPhoneRule,
} from './validation/customTourRules';
import { StyledInput, StyledTextarea } from '../../form/field-styles';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, getCountryOptions } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Spinner } from '@/components/ui/spinner';
import { useWatch } from 'react-hook-form';
import { CUSTOM_TOUR_ACTIVITIES } from '@/lib/customTour/constants';

const CustomTourForm = () => {
  const [activities, setActivities] = useState<string[]>([]);
  const { mutate: postOrder, isPending } = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CustomTourMutation>({ mode: 'onBlur' });

  const toggleActivity = (value: string) => {
    setActivities((prev) =>
      prev.includes(value)
        ? prev.filter((activity) => activity !== value)
        : [...prev, value],
    );
  };

  const createCustomTour: SubmitHandler<CustomTourMutation> = (data) => {
    const payload: CustomTourPost = {
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      customTour: {
        countryCode: data.countryCode,
        startDate: data.startDate,
        endDate: data.endDate,
        hotel: data.hotel,
        description: data.description,
        activities,
      },
    };

    postOrder(payload, {
      onSuccess: () => {
        toast.success('Заявка отправлена! Менеджер свяжется в течение часа', {
          position: 'top-center',
        });
        reset({
          countryCode: '',
          startDate: '',
          endDate: '',
          hotel: '',
          description: '',
          clientName: '',
          clientPhone: '',
        });

        setActivities([]);
      },
      onError: () =>
        toast.error('Ошибка сервера, попробуйте позже', {
          position: 'top-center',
        }),
    });
  };

  const startDateValue = useWatch({ control, name: 'startDate' });

  const countryOptions = getCountryOptions()

  return (
    <>
      <section
        aria-label="Форма заявки на индивидуальный тур"
        className="rounded-[20px] border border-border bg-card"
      >
        <form onSubmit={handleSubmit(createCustomTour)} className="p-8">
          <fieldset className="mb-7 border-0 p-0">
            <legend className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Куда и когда
            </legend>

            <div className="mb-4">
              <label
                htmlFor="countryCode"
                className="mb-2 block text-sm font-semibold text-[var(--navy-700)]"
              >
                Направление
              </label>
              <Controller
                control={control}
                name="countryCode"
                rules={countryCodeRule}
                render={({ field, fieldState }) => (
                  <>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        onBlur={field.onBlur}
                        className={cn(
                          'cursor-pointer w-full rounded-xl border-[1.5px] border-slate-200 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 px-5 py-6',
                          fieldState.error && 'border-red-400',
                        )}
                        id="countryCode"
                      >
                        <div className="inline-flex gap-2 items-center">
                          <MapPinned className="stroke-1" />
                          <SelectValue placeholder="Выберите страну" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="p-3 border-1 border-cyan-400">
                        {countryOptions.map((country) => (
                          <SelectItem
                            key={country.code}
                            value={country.code}
                            className="cursor-pointer py-3 px-6"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">
                                {country.code}
                              </span>
                              <span>{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-semibold text-[var(--navy-700)]"
                >
                  Примерно с
                </label>
                <Controller
                  control={control}
                  name="startDate"
                  rules={startDateRule}
                  render={({ field, fieldState }) => (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              'w-full rounded-xl border-[1.5px] border-slate-200 px-5 py-3.5 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 flex items-center text-muted-foreground gap-2 cursor-pointer',
                              fieldState.error && 'border-red-400',
                            )}
                          >
                            <Calendar1 className="stroke-1 size-4" />
                            {field.value ? (
                              format(new Date(field.value), 'PPP', {
                                locale: ru,
                              })
                            ) : (
                              <span>Выберите дату начала</span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            onSelect={(date) => field.onChange(date?.toISOString())}
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldState.error && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-semibold text-[var(--navy-700)]"
                >
                  по
                </label>
                <Controller
                  control={control}
                  name="endDate"
                  rules={endDateRule}
                  render={({ field, fieldState }) => (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              'w-full rounded-xl border-[1.5px] border-slate-200 px-5 py-3.5 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 flex items-center text-muted-foreground gap-2 cursor-pointer',
                              fieldState.error && 'border-red-400',
                            )}
                          >
                            <Calendar1 className="stroke-1 size-4" />
                            {field.value ? (
                              format(new Date(field.value), 'PPP', {
                                locale: ru,
                              })
                            ) : (
                              <span>Выберите дату конца</span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            disabled={(date) =>
                              startDateValue
                                ? date <= new Date(startDateValue)
                                : date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            onSelect={(date) => field.onChange(date?.toISOString())}
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldState.error && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="mb-7 border-0 p-0">
            <legend className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400 sr-only">
              Пожелания
            </legend>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-100" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Пожелания (необязательно)
              </p>
              <span className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="mb-4">
              <label
                htmlFor="hotel"
                className="mb-2 block text-sm font-semibold text-[var(--navy-700)]"
              >
                Отель
              </label>
              <div>
                <div className="relative">
                  <Hotel className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <StyledInput
                    id="hotel"
                    className={cn(
                      'w-full rounded-xl border-[1.5px] border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10',
                    )}
                    placeholder="Название отеля"
                    {...register('hotel')}
                  />
                </div>
                {errors.hotel && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.hotel.message}
                  </p>
                )}
              </div>
            </div>

            <div role="group" aria-label="Что хотите от поездки">
              <span className="mb-2 block text-sm font-semibold text-[var(--navy-700)]">
                Что хотите от поездки
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CUSTOM_TOUR_ACTIVITIES.map((activity) => {
                  const isActive = activities.includes(activity.value);
                  const Icon = activity.icon;
                  return (
                    <button
                      key={activity.value}
                      type="button"
                      onClick={() => toggleActivity(activity.value)}
                      className={cn(
                        'flex justify-center items-center gap-3 cursor-pointer rounded-xl border-[1.5px] px-3 py-2.5 text-sm font-medium transition',
                        isActive
                          ? 'border-cyan-700 bg-cyan-50 text-cyan-700'
                          : 'border-slate-200 bg-white text-[var(--navy-700)] hover:border-cyan-700',
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{activity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-[var(--navy-700)]"
              >
                Комментарий
              </label>
              <StyledTextarea
                id="description"
                rows={4}
                placeholder="Сколько человек, бюджет, что важно..."
                className="w-full resize-none rounded-xl border-[1.5px] border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10"
                {...register('description')}
              />
            </div>
          </fieldset>

          <fieldset className="border-0 p-0">
            <legend className="sr-only">Контактные данные</legend>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-100" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Как с вами связаться
              </p>
              <span className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="clientName"
                  className="mb-2 block text-sm font-semibold text-[var(--navy-700)]"
                >
                  Ваше имя
                </label>
                <div>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <StyledInput
                      id="clientName"
                      type="text"
                      placeholder="Как к вам обращаться"
                      className={cn(
                        'w-full rounded-xl border-[1.5px] border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10',
                        errors.clientName && 'border-red-400',
                      )}
                      {...register('clientName', clientNameRule)}
                    />
                  </div>
                  {errors.clientName && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.clientName.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="clientPhone"
                  className="mb-2 block text-sm font-semibold text-[var(--navy-700)]"
                >
                  Телефон
                </label>
                <div>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <StyledInput
                      id="clientPhone"
                      type="text"
                      placeholder="+996"
                      className={cn(
                        'w-full rounded-xl border-[1.5px] border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10',
                        errors.clientPhone && 'border-red-400',
                      )}
                      {...register('clientPhone', clientPhoneRule)}
                    />
                  </div>
                  {errors.clientPhone && (
                    <p className="mt-2 text-xs text-red-500">
                      {errors.clientPhone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--navy-700)] py-4 text-[15px] font-semibold text-white transition hover:bg-[var(--navy-800)] disabled:opacity-60"
          >
            <Send className="size-[18px] text-cyan-400" />
            Отправить заявку {isPending && <Spinner />}
          </button>

          <p className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-cyan-700" />
            Менеджер свяжется с вами в течение часа
          </p>
        </form>
      </section>
    </>
  );
};

export default CustomTourForm;
