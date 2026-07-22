'use client';

import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { ManagerPasswordMutation } from '@/types/user';
import { Input } from '@/components/ui/input';
import { inputClass } from '@/lib/constants';
import { useChangeManagerPassword } from '@/lib/hooks/managerHook';
import { useModalStore } from '@/lib/stores/modalStore';

interface Props {
  managerId: string;
}

export const ChangeManagerPasswordForm = ({ managerId }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ManagerPasswordMutation>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  const { mutate, isPending } = useChangeManagerPassword(setError);
  const { closeModal } = useModalStore();

  const onSubmit = (data: ManagerPasswordMutation) => {
    mutate(
      { id: managerId, password: data.password },
      {
        onSuccess: () => {
          reset();
          closeModal();
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      autoComplete="off"
    >
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Новый пароль
        </label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Введите новый пароль',
              minLength: {
                value: 6,
                message: 'Минимум 6 символов',
              },
            })}
            className={inputClass}
            placeholder="******"
            disabled={isPending}
            id="password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {!showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Подтверждение пароля
        </label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword', {
              required: 'Подтвердите пароль',
              validate: (v) =>
                v === watch('password') || 'Пароли не совпадают',
            })}
            className={inputClass}
            placeholder="******"
            disabled={isPending}
            id="confirmPassword"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {!showConfirmPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[#1E2B6D] px-4 py-3 font-semibold text-white transition
                hover:bg-[#162356] disabled:opacity-50"
      >
        {isPending ? 'изменение...' : 'Изменить пароль'}
      </button>
    </form>
  );
};