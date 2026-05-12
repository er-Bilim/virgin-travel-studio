'use client';

import { useRouter } from 'next/navigation';

import {inputClass, roleDashboardPaths} from '@/lib/constants';
import { useLogin } from '@/lib/hooks';
import type { LoginMutation } from '@/types/user';
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import { Eye, EyeOff } from "lucide-react";
import {Button} from "@/components/ui/button";

const LoginPage = () => {
    const router = useRouter();
    const loginMutation = useLogin();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, reset, formState: {errors}} = useForm<LoginMutation>({
        defaultValues: {
            phone: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginMutation) => {

        loginMutation.mutate(data, {
            onSuccess: (data) => {
                router.push(roleDashboardPaths[data.user.role]);
            },
        });
        reset();
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F8F4] px-4 ">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl"
            >
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-[#1E2B6D]">
                        Virgin Travel Studio
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Войдите в панель управления
                    </p>
                </div>

                <div className="space-y-4">
                    <Input
                        {...register('phone',{
                            required: 'Введите номер телефона',
                            validate: (value) => value.trim() !== "" || "Поле не должно быть пустым",
                            pattern: {
                                value: /^\+?[0-9]{7,15}$/,
                                message: 'Некорректный номер телефона',
                            },
                        })}
                        className={inputClass}
                        placeholder="Телефон"
                        id="phone"
                        disabled={loginMutation.isPending}
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-500">
                            {errors.phone.message}
                        </p>
                    )}
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            {...register('password', {
                                required: 'Введите пароль',
                                validate: (value) => value.trim() !== "" || "Поле не должно быть пустым",
                                minLength: { value: 6, message: 'Пароль должен содержать минимум 6 символов' }
                            })}
                            className={inputClass}
                            placeholder="Пароль"
                            id="password"
                            disabled={loginMutation.isPending}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                    </div>

                    <button
                        className="w-full rounded-2xl bg-[#1E2B6D] px-4 py-3 font-semibold text-white transition hover:bg-[#176C99] disabled:opacity-50"
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? 'Вход...' : 'Войти'}
                    </button>

                    {loginMutation.isError && (
                        <p className="text-center text-sm text-red-500">
                            Неверный телефон или пароль
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LoginPage;