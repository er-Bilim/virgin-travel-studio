'use client';

import { useEffect } from 'react';
import {
  useForm,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import type { IContactSettings } from '@/types/contactSettings';
import { Input } from '@/components/ui/input';
import { imageUrl, inputClass, isDev } from '@/lib/constants';
import {
  mutateContacts,
  mutateCreateContacts,
  useContacts,
} from '@/lib/hooks/contactSettings';
import { Loader2 } from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import Image from 'next/image';

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
  const {
    data: contactSettings,
    isPending: isFetchingContacts,
    error,
  } = useContacts();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IContactSettings>({
    defaultValues: contactSettings || {},
  });

  useEffect(() => {
    if (contactSettings) {
      reset(contactSettings);
    }
  }, [contactSettings, reset]);

  const isNew = !contactSettings;

  const { mutate, isPending } = isNew
    ? mutateCreateContacts()
    : mutateContacts();

  const onSubmit = (data: IContactSettings) => {
    const formattedData = { ...data };

    if (formattedData.workingHours) {
      if (formattedData.workingHours.saturday?.isClosed) {
        formattedData.workingHours.saturday = {
          isClosed: true,
          from: '',
          to: '',
        };
      }

      if (formattedData.workingHours.sunday?.isClosed) {
        formattedData.workingHours.sunday = {
          isClosed: true,
          from: '',
          to: '',
        };
      }
    }

    const formData = new FormData();

    formData.append('phone', formattedData.phone);
    formData.append('email', formattedData.email);
    formData.append('address', formattedData.address);

    if (formattedData.whatsapp)
      formData.append('whatsapp', formattedData.whatsapp);
    if (formattedData.telegram)
      formData.append('telegram', formattedData.telegram);
    if (formattedData.instagram)
      formData.append('instagram', formattedData.instagram);
    if (formattedData.facebook)
      formData.append('facebook', formattedData.facebook);
    if (formattedData.mapEmbedUrl)
      formData.append('mapEmbedUrl', formattedData.mapEmbedUrl);

    if (formattedData.workingHours) {
      formData.append(
        'workingHours',
        JSON.stringify(formattedData.workingHours),
      );
    }

    const logoFile = formattedData.logo?.[0];

    if (logoFile instanceof File) {
      formData.append('logo', logoFile);
    }

    mutate(formData);
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
        <AlertDialog>
          Ошибка при загрузке контактов, попробуйте ещё раз
        </AlertDialog>
      )}

      {isFetchingContacts && (
        <Spinner className="absolute flex justify-center items-center inset-0 z-2" />
      )}

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

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 gap-4">
        <Field label="Facebook:" error={errors.facebook?.message}>
          <Input
            {...register('facebook')}
            className={inputClass}
            disabled={isPending}
            placeholder="https://facebook.com/..."
          />
        </Field>

        <Field
          label="Ссылка на карту (Google Maps Embed URL):"
          error={errors.mapEmbedUrl?.message}
        >
          <Input
            {...register('mapEmbedUrl')}
            className={inputClass}
            disabled={isPending}
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
        </Field>

        <Field
          label="Логотип:"
          error={errors.logo?.message as string | undefined}
        >
          <Input
            type="file"
            accept="image/*"
            {...register('logo')}
            className={inputClass}
            disabled={isPending}
          />
        </Field>

        {typeof contactSettings?.logo === 'string' && contactSettings.logo && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              Текущий логотип:
            </p>
            <Image
              src={imageUrl + contactSettings.logo}
              alt="Текущий логотип"
              width={50}
              height={50}
              unoptimized={isDev}
              className="object-contain"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Рабочие часы:</p>

        <div className="rounded-2xl border border-gray-100 p-4 space-y-4 divide-y">
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

          <WeekendField
            label="Суббота"
            register={register}
            watch={watch}
            errors={errors}
            field="saturday"
            isPending={isPending}
            inputClass={inputClass}
            setValue={setValue}
          />

          <WeekendField
            label="Воскресенье"
            register={register}
            watch={watch}
            errors={errors}
            field="sunday"
            isPending={isPending}
            inputClass={inputClass}
            setValue={setValue}
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

interface WeekendFieldProps {
  label: string;
  register: UseFormRegister<IContactSettings>;
  watch: UseFormWatch<IContactSettings>;
  errors: FieldErrors<IContactSettings>;
  field: 'saturday' | 'sunday';
  isPending: boolean;
  inputClass: string;
  setValue: UseFormSetValue<IContactSettings>;
}

function WeekendField({
  label,
  register,
  watch,
  errors,
  field,
  isPending,
  inputClass,
  setValue,
}: WeekendFieldProps) {
  const isClosed = watch(`workingHours.${field}.isClosed`);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>

        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            {...register(`workingHours.${field}.isClosed`, {
              onChange: (e) => {
                if (e.target.checked) {
                  setValue(`workingHours.${field}.from`, '');
                  setValue(`workingHours.${field}.to`, '');
                }
              },
            })}
            disabled={isPending}
            className="rounded"
          />
          Выходной
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Field label="С" error={errors.workingHours?.[field]?.from?.message}>
          <Input
            type="time"
            {...register(`workingHours.${field}.from`)}
            className={inputClass}
            disabled={isPending || isClosed}
          />
        </Field>

        <span className="text-gray-400 mt-5">—</span>

        <Field label="До" error={errors.workingHours?.[field]?.to?.message}>
          <Input
            type="time"
            {...register(`workingHours.${field}.to`)}
            className={inputClass}
            disabled={isPending || isClosed}
          />
        </Field>
      </div>
    </div>
  );
}
