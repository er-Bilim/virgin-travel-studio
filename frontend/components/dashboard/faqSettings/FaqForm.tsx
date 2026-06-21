'use client';

import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import type { AxiosError } from 'axios';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { inputClass } from '@/lib/constants';
import { mutateCreateFaq, mutateEditFaq } from '@/lib/hooks/faq';
import type { GlobalError } from '@/types/error';
import type { Faq, FaqMutation } from '@/types/faq';

interface FaqFormProps {
  faq?: Faq | null;
  onClose: () => void;
}

export function FaqForm({ faq, onClose }: FaqFormProps) {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const isEdit = !!faq;

  const { mutate: createFaq, isPending: isCreating } = mutateCreateFaq();
  const { mutate: editFaq, isPending: isEditing } = mutateEditFaq();
  const isSaving = isCreating || isEditing;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FaqMutation>({
    defaultValues: {
      question: faq?.question || '',
      answer: faq?.answer || '',
      isPublished: faq ? faq.isPublished : true,
    },
  });

  const onSubmit = (data: FaqMutation) => {
    setGlobalError(null);

    const mutationOptions = {
      onSuccess: () => {
        onClose();
      },
      onError: (err: unknown) => {
        const axiosError = err as AxiosError<GlobalError>;
        const serverResponse = axiosError.response?.data;

        if (!serverResponse) {
          setGlobalError('Сервер не отвечает. Проверьте подключение к сети.');
          return;
        }

        if ('details' in serverResponse) {
          Object.keys(serverResponse.details).forEach((path) => {
            setError(path as Parameters<typeof setError>[0], {
              type: 'server',
              message: serverResponse.details[path].message,
            });
          });
          setGlobalError(serverResponse.error);
        } else {
          setGlobalError(serverResponse.error);
        }
      },
    };

    if (isEdit && faq) {
      editFaq({ id: faq._id, data }, mutationOptions);
    } else {
      createFaq(data, mutationOptions);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2" autoComplete="off">
      {globalError && (
        <div className="p-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-2xl">
          {globalError}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Вопрос: *</label>
        <Input
          {...register('question', { required: 'Поле вопроса обязательно к заполнению' })}
          className={`${inputClass} ${errors.question ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          disabled={isSaving}
          placeholder="Например: Включен ли трансфер в стоимость тура?"
        />
        {errors.question && <p className="text-xs font-semibold text-red-500 pt-0.5">{errors.question.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Развернутый ответ: *</label>
        <textarea
          {...register('answer', { required: 'Поле ответа обязательно к заполнению' })}
          className={`${inputClass} min-h-[120px] py-2.5 resize-y ${
            errors.answer ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
          disabled={isSaving}
          placeholder="Опишите подробный ответ на вопрос..."
        />
        {errors.answer && <p className="text-xs font-semibold text-red-500 pt-0.5">{errors.answer.message}</p>}
      </div>

      {!isEdit && (
        <div className="flex items-center gap-2 pt-1">
          <input
            id="isPublished"
            type="checkbox"
            {...register('isPublished')}
            disabled={isSaving}
            className="w-4 h-4 rounded border-gray-300 text-[#1E2B6D] focus:ring-[#1E2B6D]"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            Опубликовать сразу на сайте
          </label>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="rounded-xl px-5 text-gray-600 border-gray-200"
          disabled={isSaving}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[#1E2B6D] hover:bg-[#162356] text-white rounded-xl px-5"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Сохранение...
            </span>
          ) : isEdit ? (
            'Сохранить изменения'
          ) : (
            'Добавить вопрос'
          )}
        </Button>
      </div>
    </form>
  );
}