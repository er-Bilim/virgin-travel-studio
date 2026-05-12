"use client";

import { useForm } from "react-hook-form";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { ManagerMutation } from "@/types/user";
import { useCreateManager } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { inputClass } from "@/lib/constants";

export const CreateManagerForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ManagerMutation>({
    defaultValues: {
      fullName: "",
      phone: "",
      password: "",
    },
  });
  const { mutate, isPending } = useCreateManager(setError);

  const onSubmit = (data: ManagerMutation) => {
    mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
      autoComplete="off"
    >
      <h2 className="text-xl font-semibold text-[#1E2B6D]">
        Создание менеджера
      </h2>

      <div className="space-y-1">
        <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Личные данные ФИО
        </label>

        <Input
          id="fullName"
          {...register("fullName", {
            required: "Введите имя",
            validate: (v) => v.trim() !== "" || "Поле не должно быть пустым",
            minLength: {
              value: 2,
              message: "Имя должно больше 2 символов",
            },
          })}
          className={inputClass}
          placeholder="John Doe"
          disabled={isPending}
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
          {...register("phone", {
            required: "Введите номер телефона",
            pattern: {
              value: /^\+?[0-9]{7,15}$/,
              message: "Некорректный номер телефона",
            },
          })}
          className={inputClass}
          placeholder="+996700000000"
          disabled={isPending}
        />

        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Пароль
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Введите пароль",
              minLength: {
                value: 6,
                message: "Минимум 6 символов",
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

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[#1E2B6D] px-4 py-3 font-semibold text-white transition
                hover:bg-[#162356] disabled:opacity-50"
      >
        {isPending ? "создание..." : "Создать менеджера"}
      </button>
    </form>
  );
};
