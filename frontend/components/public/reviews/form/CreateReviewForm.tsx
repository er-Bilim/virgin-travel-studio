'use client';

import { Controller, useForm } from 'react-hook-form';
import type { IReviewMutation } from '@/types/review';
import {
  clientNameRule,
  commentRule,
  ratingRule,
} from './validation/reviewRules';
import { Button } from '@/components/ui/button';
import Rating from '@/components/shared/Rating';
import {
  StyledInput,
  StyledTextarea,
} from '@/components/shared/form/field-styles';
import { useCreateReview, useUpdateReview } from '@/lib/hooks/reviewHooks';
import PhotoDropzone from '@/components/shared/PhotoDropzone';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import ReviewerBadge from '../ReviewerBadge';

interface Props {
  tourId?: string;
  initialData?: Partial<IReviewMutation>;
  reviewId?: string;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const CreateReviewForm = ({
                            tourId,
                            initialData,
                            reviewId,
                            isEditing = false,
                            onSuccess,
                          }: Props) => {
  const [clientName, setClientName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { mutate, isPending: loadingReview } = useCreateReview();
  const { mutate: updateMutate, isPending: updatingReview } =
    useUpdateReview();

  const ratingOptions = [
    {
      label: 'Выберите оценку',
      color: 'text-gray-500',
    },
    {
      label: 'Плохо',
      color: 'text-red-500',
    },
    {
      label: 'Так себе',
      color: 'text-orange-500',
    },
    {
      label: 'Нормально',
      color: 'text-yellow-500',
    },
    {
      label: 'Хорошо',
      color: 'text-lime-500',
    },
    {
      label: 'Отлично!',
      color: 'text-green-500',
    },
  ];

  const defaultValues: IReviewMutation = {
    clientName: initialData?.clientName || '',
    rating: initialData?.rating || 0,
    comment: initialData?.comment || '',
    image: null,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<IReviewMutation>({ defaultValues });

  const onSubmit = (data: IReviewMutation) => {
    setClientName(data.clientName);

    const newData = {
      ...data,
      tourId,
    };

    if (isEditing && reviewId) {
      updateMutate(
        {
          id: reviewId,
          data: newData,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );

      return;
    }

    mutate(newData, {
      onSuccess: () => {
        setSubmitted(true);

        reset({
          clientName: data.clientName,
          rating: 0,
          comment: '',
          image: null,
        });

        onSuccess?.();
      },
    });
  };

  if (submitted && !isEditing) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle className="mx-auto mb-3 size-12 text-green-400" />
        <h3 className="text-lg font-medium text-foreground">
          Спасибо за отзыв!
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Он появится на странице после модерации
        </p>
        <div className="mt-5">
          <ReviewerBadge name={clientName} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border-0 sm:border border-[var(--border)] p-3 sm:p-6 rounded-2xl sm:rounded-4xl">
      <h3 className="font-semibold text-[var(--card-foreground)] text-xl sm:text-2xl">
        {isEditing ? 'Редактировать отзыв' : 'Оставьте ваш отзыв'}
      </h3>

      {!isEditing && (
        <p className="text-[var(--card-foreground)] text-sm mt-2 leading-snug">
          Поделитесь впечатлениями – это поможет другим путешественникам выбрать
          тур
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5 mt-4">
          <div className="min-h-16 sm:min-h-24">
            <Controller
              control={control}
              name="rating"
              rules={ratingRule}
              render={({ field, fieldState }) => (
                <div className="w-full mt-2 origin-left scale-90 xs:scale-95 sm:scale-100 transition-transform [&_div]:flex-wrap [&_div]:gap-x-3 [&_div]:gap-y-1 [&_span]:text-xs sm:[&_span]:text-sm">
                  <Rating
                    value={field.value}
                    onChangeStarValue={field.onChange}
                    isDisabled={false}
                    ratingOptions={ratingOptions}
                    error={fieldState.error?.message}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="clientName"
              className="text-[var(--card-foreground)] text-sm font-semibold"
            >
              Имя
            </label>

            <StyledInput
              id="clientName"
              placeholder="Имя"
              {...register('clientName', clientNameRule)}
              className={`${errors.clientName && 'border-red-500 bg-red-100 focus-visible:border-red-500'}`}
            />

            {errors.clientName && (
              <p className="text-red-500 text-sm">
                {errors.clientName.message}
              </p>
            )}

            <label
              htmlFor="comment"
              className="text-[var(--card-foreground)] text-sm font-semibold"
            >
              Комментарий
            </label>

            <StyledTextarea
              id="comment"
              placeholder="Комментарий"
              {...register('comment', commentRule)}
              style={{
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
              className={`min-h-24 max-h-35 resize-none overflow-y-auto whitespace-pre-wrap ${
                errors.comment &&
                'border-red-500 bg-red-100 focus-visible:border-red-500'
              }`}
            />
            {errors.comment && (
              <p className="text-red-500 text-sm">{errors.comment.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="image">
              <p className="text-[var(--card-foreground)] text-sm font-semibold flex gap-1">
                Фото
                <span className="text-gray-500 font-normal">
                  – необязательно
                </span>
              </p>
            </label>

            <Controller
              control={control}
              name="image"
              render={({ field, fieldState }) => (
                <PhotoDropzone
                  id="image"
                  name="image"
                  className="mt-2"
                  value={field.value}
                  onFile={(file) => field.onChange(file)}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <Button
            className="cursor-pointer h-12 rounded-3xl bg-[var(--primary)] text-sm sm:text-base"
            type="submit"
            disabled={loadingReview || updatingReview}
          >
            {isEditing ? 'Сохранить изменения' : 'Оставить отзыв'}
            {(loadingReview || updatingReview) && <Spinner />}
          </Button>
        </div>

        {!isEditing && (
          <p className="text-[var(--card-foreground)] mt-4 text-center font-semibold text-xs sm:text-sm text-balance">
            Пожалуйста, не забудьте поставить оценку звёздами – это
            обязательно!
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateReviewForm;