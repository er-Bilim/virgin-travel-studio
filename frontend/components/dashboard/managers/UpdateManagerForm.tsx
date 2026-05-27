'use client';

import { Controller, useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { IUser, ManagerUpdateMutation } from '@/types/user';
import { Input } from '@/components/ui/input';
import { inputClass } from '@/lib/constants';
import { useUpdateManager } from '@/lib/hooks/managerHook';
import { Label } from '@/components/ui/label';


interface Props {
  initialValues: IUser;
}

export const UpdateManagerForm = ({ initialValues }: Props) => {

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ManagerUpdateMutation>({
    defaultValues: initialValues || {
      fullName: '',
      phone: '',
      status: ''
    },
  });
  const { mutate: update, isPending: isUpdating } = useUpdateManager(setError);

  const onSubmit = (data: ManagerUpdateMutation) => {
    update({ id: initialValues._id, data });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold text-[#1E2B6D]">
        Обновление менеджера
      </h2>

      <div className="space-y-1">
        <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Личные данные ФИО
        </label>

        <Input
          id="fullName"
          {...register('fullName', {
            required: 'Введите имя',
            validate: (v) => v.trim() !== '' || 'Поле не должно быть пустым',
            minLength: {
              value: 2,
              message: 'Имя должно содержать не менее 2 символов',
            },
          })}
          className={inputClass}
          placeholder="John Doe"
          disabled={isUpdating}
        />

        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Телефон
        </label>

        <Input
          id="phone"
          {...register('phone', {
            required: 'Введите номер телефона',
            pattern: {
              value: /^\+?[0-9]{7,15}$/,
              message: 'Некорректный номер телефона',
            },
          })}
          className={inputClass}
          placeholder="+996700000000"
          disabled={isUpdating}
        />

        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1 flex gap-3 items-center">
        <p className="text-sm font-medium text-gray-700 m-0">Статус</p>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="p-2 flex gap-4"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  className="border border-gray"
                  value="active"
                  id="r1"
                />
                <Label htmlFor="r1">Активный</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  className="border border-gray"
                  value="banned"
                  id="r2"
                />
                <Label htmlFor="r2">Бан</Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isUpdating}
        className="w-full rounded-2xl bg-[#1E2B6D] px-4 py-3 font-semibold text-white transition
                hover:bg-[#162356] disabled:opacity-50"
      >
        {isUpdating ? 'обновление...' : 'Обновить'}
      </button>
    </form>
  );
};
