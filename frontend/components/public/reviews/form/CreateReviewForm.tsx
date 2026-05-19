'use client';

import { Controller, useForm } from 'react-hook-form';
import type { IReviewMutation } from '@/types/review';
import { commentRule, ratingRule } from './validation/reviewRules';
import { Button } from '@/components/ui/button';
import Rating from '@/components/shared/Rating';
import { StyledTextarea } from '@/components/shared/form/field-styles';
import { useCreateReview } from '@/lib/hooks/reviewHooks';
import PhotoDropzone from '@/components/shared/PhotoDropzone';
import { getTourId } from '@/lib/tour/tourId';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useUser } from '@/lib/hooks/authHooks';
import { Spinner } from '@/components/ui/spinner';
import ReviewerBadge from '../ReviewerBadge';
import { toast } from 'sonner';

const CreateReviewForm = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { mutate, isPending: loadingReview } = useCreateReview();
  const { data: me, isLoading: loadingUser, isError } = useUser();

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
    clientName: '',
    rating: 0,
    comment: '',
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
    if (!me) {
      return toast.error('Ошибка: Не был получен пользователь')
    };

    const newData = {
      ...data,
      tourId: getTourId(),
      clientName: me.fullName,
    };

    try {
      mutate(newData, {
        onSuccess: () => {
          setSubmitted(true);
          reset({
            rating: 0,
            comment: '',
            image: null,
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderClientName = () => {
    if (loadingUser) {
      return <Spinner />;
    }

    if (isError) {
      return (
        <p className="text-lg text-muted-foreground font-semibold">Ошибка</p>
      );
    }

    if (!me) {
      return <ReviewerBadge name="Аноним" />;
    };

    return <ReviewerBadge name={me.fullName} />;
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle className="mx-auto mb-3 size-12 text-green-400" />
        <h3 className="text-lg font-medium text-foreground">
          Спасибо за отзыв!
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Он появится на странице после модерации
        </p>
        <div className="mt-5">{renderClientName()}</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border-1 border-[var(--border)] p-7 rounded-4xl">
      <div className="mb-5">{renderClientName()}</div>
      <h3 className="font-semibold text-[var(--card-foreground)] text-2xl">
        Оставьте ваш отзыв
      </h3>
      <p className="text-[var(--card-foreground)] mt-2">
        Поделитесь впечатлениями – это поможет другим путешественникам выбрать
        тур
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-8">
          <Controller
            control={control}
            name="rating"
            rules={ratingRule}
            render={({ field, fieldState }) => (
              <Rating
                value={field.value}
                onChangeStarValue={field.onChange}
                isDisabled={false}
                ratingOptions={ratingOptions}
                className="mt-2"
                error={fieldState.error?.message}
              />
            )}
          />
          <div className="flex flex-col gap-2">
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
              className={`${errors.comment && 'border-red-500 bg-red-100 focus-visible:border-red-500'}`}
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
            className="cursor-pointer h-12 rounded-3xl bg-[var(--primary)]"
            type="submit"
            disabled={loadingReview}
          >
            Оставить отзыв {loadingReview && <Spinner />}
          </Button>
        </div>
        <p className="text-[var(--card-foreground)] mt-6 text-center font-semibold text-sm">
          Пожалуйста, не забудьте поставить оценку звёздами – это обязательно!
        </p>
      </form>
    </div>
  );
};

export default CreateReviewForm;
