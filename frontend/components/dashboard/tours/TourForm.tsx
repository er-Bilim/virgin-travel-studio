'use client';

import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Loader2, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MultiImageInput from '@/components/dashboard/MultiImageInput/MultiImageInput';
import { apiURL, inputClass } from '@/lib/constants';
import { useCategories } from '@/lib/hooks/categoryHooks';
import { useCreateTour, useUpdateTour } from '@/lib/hooks/tourHooks';
import type { TourMutation, TourFormValues } from '@/types/tour';
import countries from 'i18n-iso-countries';
import ru from 'i18n-iso-countries/langs/ru.json';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface Props {
  isEdit?: boolean;
  initialValues?: TourMutation;
  tourId?: string;
}

export const TourForm = ({ isEdit = false, initialValues, tourId }: Props) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const baseToursPath = '/admin/tours';
  const { data: categoriesData, isLoading: isCatsLoading } = useCategories();
  const { mutate: createTour, isPending: isCreating } = useCreateTour();
  const { mutate: updateTour, isPending: isUpdating } = useUpdateTour();

  const isPending = isCreating || isUpdating;
  const categories = categoriesData?.categories;
  countries.registerLocale(ru);
  const countryOptions = Object.entries(countries.getNames('ru')).map(
    ([alpha2, name]) => ({
      code: countries.alpha2ToAlpha3(alpha2) ?? alpha2,
      name,
    }),
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TourFormValues>({
    defaultValues: initialValues
      ? {
          ...initialValues,
          baseAdvantages: initialValues.baseAdvantages.map((value) => ({
            value,
          })),
        }
      : {
          title: '',
          description: '',
          countryCode: '',
          category: '',
          baseAdvantages: [{ value: '' }],
          images: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'baseAdvantages',
  });

  const onSubmit = (formValues: TourFormValues) => {
    const data: TourMutation = {
      ...formValues,
      baseAdvantages: formValues.baseAdvantages.map((adv) => adv.value),
    };
    if (!isEdit) {
      createTour(data, {
        onSuccess: () => {
          reset();
          router.push(baseToursPath);
        },
      });
    } else {
      if (!tourId) return;

      updateTour(
        { id: tourId, data },
        {
          onSuccess: () => {
            router.push(baseToursPath);
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
        {isEdit ? 'Редактирование тура' : 'Создание тура'}
      </h2>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Название тура
        </label>
        <Input
          {...register('title', { required: 'Введите название' })}
          className={`${inputClass} ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          disabled={isPending}
          placeholder="Введите название тура"
        />
        {errors.title && (
          <p className="text-xs font-semibold text-red-500 pt-0.5">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Категория</label>
        <Controller
          control={control}
          name="category"
          rules={{ required: 'Выберите категорию' }}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isPending}
            >
              <SelectTrigger
                className={`${inputClass} ${errors.category ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <SelectValue
                  placeholder={
                    isCatsLoading ? (
                      <span className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1E2B6D]" />{' '}
                        Загрузка категорий...
                      </span>
                    ) : (
                      'Выберите категорию'
                    )
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-xs font-semibold text-red-500 pt-0.5">
            {errors.category.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Описание</label>
        <Textarea
          {...register('description', { required: 'Введите описание' })}
          className={`${inputClass} min-h-[100px] resize-none ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          disabled={isPending}
          placeholder="Введите описание тура"
        />
        {errors.description && (
          <p className="text-xs font-semibold text-red-500 pt-0.5">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Страна</label>
        <Controller
          control={control}
          name="countryCode"
          rules={{ required: 'Выберите страну' }}
          render={({ field }) => {

            const selectedName = countryOptions.find(
              (c) => c.code === field.value,
            )?.name;

            return (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isPending || isCatsLoading}
                    className={cn(
                      inputClass,
                      'w-full justify-between font-normal',
                      errors.countryCode && 'border-red-500 focus:ring-red-500',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    {isCatsLoading ? (
                      <span className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1E2B6D]" />
                        Загрузка стран...
                      </span>
                    ) : (
                      (selectedName ?? 'Выберите страну')
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Введите название страны..." />
                    <CommandEmpty>Страна не найдена</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {countryOptions.map(({ code, name }) => (
                        <CommandItem
                          key={code}
                          value={name}
                          onSelect={() => {
                            field.onChange(code);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              field.value === code
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            );
          }}
        />
        {errors.countryCode && (
          <p className="text-xs font-semibold text-red-500 pt-0.5">
            {errors.countryCode.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 leading-none">
          Базовые преимущества
        </label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  {...register(`baseAdvantages.${index}.value`, {
                    required: 'Поле не может быть пустым',
                  })}
                  className={`${inputClass} ${errors.baseAdvantages?.[index]?.value ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={isPending}
                  placeholder="Введите преимущество"
                />
                {fields.length > 1 && (
                  <button
                    aria-label="Удалить"
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {errors.baseAdvantages?.[index]?.value && (
                <p className="text-xs font-semibold text-red-500 pt-0.5">
                  {errors.baseAdvantages[index]?.value?.message}
                </p>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => append({ value: '' })}
          className="inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-gray-200 text-[#1E2B6D] bg-transparent hover:bg-gray-50 h-10 px-4 w-full mt-2 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" /> Добавить преимущество
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Фотографии (до 5 штук)
        </label>

        {isEdit ? (
          <Controller
            control={control}
            name="images"
            render={({ field }) => {
              const previews = field.value.map((item) => {
                if (typeof item === 'string')
                  return `${apiURL}/tours/image/${item}`;
                else return item;
              });
              return (
                <MultiImageInput
                  name="images"
                  label="Выберите изображения"
                  onChange={field.onChange}
                  value={field.value}
                  previewsValues={previews}
                  showPreviews={true}
                  allowReorder={true}
                />
              );
            }}
          />
        ) : (
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <MultiImageInput
                name="images"
                label="Выберите изображения"
                onChange={field.onChange}
                value={field.value}
                showPreviews={true}
              />
            )}
          />
        )}
      </div>

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
          'Сохранить изменения'
        ) : (
          'Создать тур'
        )}
      </button>
    </form>
  );
};
