'use client';

import { useCreateOrder } from '@/lib/hooks/orderHooks';
import type { CustomTourMutation, CustomTourPost } from '@/types/order';
import { BadgeInfo, Calendar1, MapPinned, Route } from 'lucide-react';
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
import countries from '@/lib/countries';
import { countryCodeRule, startDateRule } from './validation/customTourRules';
import { StyledInput } from '../../form/field-styles';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn, formatDayAndMonthWords } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const CustomTourForm = () => {
  const [activities, setActivities] = useState<string[]>([]);
  const { mutate: postOrder, isPending } = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errros },
    reset,
    control,
    watch,
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
      onSuccess: () =>
        toast.success('Заявка отправлена! Менеджер свяжется в течение часа', {
          position: 'top-center',
        }),
      onError: () =>
        toast.error('Ошибка сервера, попробуйте позже', {
          position: 'top-center',
        }),
    });
  };

  const startDateValue = watch('startDate');

  const countryOptions = Object.entries(
    countries.getNames('ru', { select: 'official' }),
  )
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
    
  return (
    <section aria-label="custom-tour-title" className="mx-auto my-16 max-w-3xl">
      <article className="overflow-hidden rounded-3xl bg-card border">
        <header className="overflow-hidden bg-[var(--primary)] p-8">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
            <Route className="size-4" />
            Индивидульный маршрут
          </p>
          <h1
            id="custom-tour-title"
            className="mb-2 text-2xl font-bold text-white"
          >
            Составь свой тур
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[var(--silver)]">
            Расскажите о поездке мечты. Мы соберём маршрут специально для вас.
            Это заявка, а не бронь
          </p>
        </header>

        <form onSubmit={handleSubmit(createCustomTour)} className="p-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4">
            <BadgeInfo className="mt-1 size-5 shrink-0 text-cyan-700" />
            <p className="text-sm leading-relaxed text-slate-600">
              Заполните что знаете – остальное уточнит менеджер: проверит
              возможность и посчитает стоимость. Вы ни к чему не обязаны.
            </p>
          </div>

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
                    <Select>
                      <SelectTrigger
                        className="cursor-pointer w-full rounded-xl border-[1.5px] border-slate-200 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 px-5 py-6"
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
                            className="w-full rounded-xl border-[1.5px] border-slate-200 px-5 py-3.5 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 flex items-center text-muted-foreground gap-2 cursor-pointer"
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
                            onSelect={(date) => field.onChange(date)}
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
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-semibold text-[var(--navy-700)]"
                >
                  по
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
                            className="w-full rounded-xl border-[1.5px] border-slate-200 px-5 py-3.5 text-sm outline-none focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 flex items-center text-muted-foreground gap-2 cursor-pointer"
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
                            onSelect={(date) => field.onChange(date)}
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
        </form>
      </article>
    </section>
  );
};

export default CustomTourForm;
