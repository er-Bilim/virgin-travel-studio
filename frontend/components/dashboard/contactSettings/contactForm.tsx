'use client';

import { useForm } from 'react-hook-form';
import type { ContactSettingsFields } from '@/types/contactSettings';
import { Input } from '@/components/ui/input';
import { inputClass } from '@/lib/constants';
import { mutateContacts, mutateCreateContacts } from '@/lib/hooks/contactSettings';
import { Loader2 } from 'lucide-react';
import { useContacts } from '@/lib/hooks/contactSettings';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';


const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && (
      <p className="text-xs font-semibold text-red-500 pt-0.5">{error}</p>
    )}
  </div>
);

export default function ContactSettingsForm() {

  const { data: contactSettings, isPending: isFetchingContacts, error } = useContacts();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactSettingsFields>({
    defaultValues: contactSettings || {},
  });

  const isNew = !contactSettings;

  const { mutate, isPending } = isNew
    ? mutateCreateContacts()
    : mutateContacts();

  const onSubmit = (data: ContactSettingsFields) => {
    mutate(data);
  };

  const phoneValidate = (v?: string) => {
    if (!v) return true;
    const cleaned = v.replace(/[\s\-()]/g, '');
    return (
      /^\+996\d{9}$/.test(cleaned) ||
      /^0\d{9}$/.test(cleaned) ||
      'Номер должен начинаться с +996 или 0'
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm max-h-[90vh] overflow-y-auto relative"
      autoComplete="off"
    >
      {error && (
        <AlertDialog>Ошибка при загрузке контактов, попробуйте ещё раз</AlertDialog>
      )}
      {isFetchingContacts && <Spinner className='absolute flex justify-center items-center inset-0 z-2'/>}
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 gap-4">
        <Field label="Телефон:" error={errors.phone?.message}>
          <Input
            {...register('phone', { required: 'Введите телефон' })}
            className={`${inputClass} ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isPending}
          />
        </Field>

        <Field label="Email:" error={errors.email?.message}>
          <Input
            {...register('email', {
              required: 'Введите email',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Неверный формат email',
              },
            })}
            className={`${inputClass} ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isPending}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 gap-4">
        <Field label="Адрес:" error={errors.address?.message}>
          <Input
            {...register('address', { required: 'Введите адрес' })}
            className={`${inputClass} ${errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isPending}
          />
        </Field>

        <Field label="WhatsApp:" error={errors.whatsapp?.message}>
          <Input
            {...register('whatsapp', { validate: phoneValidate })}
            className={`${inputClass} ${errors.whatsapp ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isPending}
            placeholder="+996XXXXXXXXX или 0XXXXXXXXX"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 gap-4">
        <Field label="Telegram:" error={errors.telegram?.message}>
          <Input
            {...register('telegram')}
            className={inputClass}
            disabled={isPending}
            placeholder="@username"
          />
        </Field>

        <Field label="Instagram:" error={errors.instagram?.message}>
          <Input
            {...register('instagram')}
            className={inputClass}
            disabled={isPending}
            placeholder="https://instagram.com/..."
          />
        </Field>
      </div>

      <Field label="Facebook:" error={errors.facebook?.message}>
        <Input
          {...register('facebook')}
          className={inputClass}
          disabled={isPending}
          placeholder="https://facebook.com/..."
        />
      </Field>

      {/* Рабочие часы */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Рабочие часы:</p>

        <div className="rounded-2xl border border-gray-100 p-4 space-y-4 divide-y">
          {/* Будни */}
          <div className="pb-4">
            <p className="text-xs text-gray-500 mb-2">Будни (Пн–Пт)</p>
            <div className="flex items-center gap-3">
              <Field
                label="С"
                error={errors.workingHours?.weekdays?.from?.message}
              >
                <Input
                  {...register('workingHours.weekdays.from', {
                    required: 'Обязательное поле',
                  })}
                  type="time"
                  className={`${inputClass} ${errors.workingHours?.weekdays?.from ? 'border-red-500' : ''}`}
                  disabled={isPending}
                />
              </Field>
              <span className="text-gray-400 mt-5">—</span>
              <Field
                label="До"
                error={errors.workingHours?.weekdays?.to?.message}
              >
                <Input
                  {...register('workingHours.weekdays.to', {
                    required: 'Обязательное поле',
                  })}
                  type="time"
                  className={`${inputClass} ${errors.workingHours?.weekdays?.to ? 'border-red-500' : ''}`}
                  disabled={isPending}
                />
              </Field>
            </div>
          </div>

          {/* Суббота */}
          <WeekendField
            label="Суббота"
            register={register}
            errors={errors}
            field="saturday"
            isPending={isPending}
            inputClass={inputClass}
          />

          {/* Воскресенье */}
          <WeekendField
            label="Воскресенье"
            register={register}
            errors={errors}
            field="sunday"
            isPending={isPending}
            inputClass={inputClass}
          />
        </div>
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
        ) : (
          'Сохранить изменения'
        )}
      </button>
    </form>
  );
}

// Отдельный компонент для субботы/воскресенья с чекбоксом "Выходной"
function WeekendField({
  label,
  register,
  errors,
  field,
  isPending,
  inputClass,
}: {
  label: string;
  register: any;
  errors: any;
  field: 'saturday' | 'sunday';
  isPending: boolean;
  inputClass: string;
}) {

  return (
    <div className='pb-4'>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            {...register(`workingHours.${field}.isClosed`)}
            disabled={isPending}
            className="rounded"
          />
          Выходной
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Field label="С" error={errors.workingHours?.[field]?.from?.message}>
          <Input
            {...register(`workingHours.${field}.from`)}
            type="time"
            className={inputClass}
            disabled={isPending}
          />
        </Field>
        <span className="text-gray-400 mt-5">—</span>
        <Field label="До" error={errors.workingHours?.[field]?.to?.message}>
          <Input
            {...register(`workingHours.${field}.to`)}
            type="time"
            className={inputClass}
            disabled={isPending}
          />
        </Field>
      </div>
    </div>
  );
}
