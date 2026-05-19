'use client';

import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MultiImageInput from '@/components/dashboard/MultiImageInput/MultiImageInput';
import { inputClass } from '@/lib/constants';
import { useCategories } from '@/lib/hooks/categoryHooks';
import { useCreateTour, useUpdateTour } from '@/lib/hooks/tourHooks';
import type { TourMutation } from '@/types/tour';

interface Props {
  isEdit?: boolean;
  initialValues?: TourMutation;
  tourId?: string;
}

export const TourForm = ({ isEdit = false, initialValues, tourId }: Props) => {
  const router = useRouter();
  const { data: categories, isLoading: isCatsLoading } = useCategories();
  const { mutate: createTour, isPending: isCreating } = useCreateTour();
  const { mutate: updateTour, isPending: isUpdating } = useUpdateTour();

  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TourMutation>({
    defaultValues: initialValues || {
      title: '',
      description: '',
      category: '',
      baseAdvantages: [''],
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'baseAdvantages' as never,
  });

  const onSubmit = (data: TourMutation) => {
    if (!isEdit) {
      createTour(data, {
        onSuccess: () => {
          reset();
          router.push('/manager/tours');
        },
      });
    } else {
      if (!tourId) {
        return;
      }

      updateTour(
        { id: tourId, data },
        {
          onSuccess: () => {
            router.push('/manager/tours');
          },
        },
      );
      return;
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
          className={inputClass}
          disabled={isPending}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
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
              <SelectTrigger className={inputClass}>
                <SelectValue
                  placeholder={
                    isCatsLoading ? 'Загрузка...' : 'Выберите категорию'
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
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Описание</label>
        <Textarea
          {...register('description', { required: 'Введите описание' })}
          className={`${inputClass} min-h-[100px] resize-none`}
          disabled={isPending}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 leading-none">
          Базовые преимущества
        </label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                {...register(`baseAdvantages.${index}` as const, {
                  required: 'Поле не может быть пустым',
                })}
                className={inputClass}
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input bg-background"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => append('')}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-transparent hover:bg-accent h-9 px-4 py-2 w-full mt-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Добавить преимущество
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Фотографии (до 5 штук)
        </label>
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <MultiImageInput
              name="images"
              label="Выберите изображения"
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[#1E2B6D] px-4 py-3 font-semibold text-white transition hover:bg-[#162356] disabled:opacity-50"
      >
        {isPending
          ? 'Загрузка...'
          : isEdit
            ? 'Сохранить изменения'
            : 'Создать тур'}
      </button>
    </form>
  );
};
