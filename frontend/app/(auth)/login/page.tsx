'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { roleDashboardPaths } from '@/lib/constants';
import { useLogin } from '@/lib/hooks';
import type { LoginMutation } from '@/types/user';

const LoginPage = () => {
    const router = useRouter();
    const loginMutation = useLogin();

    const [form, setForm] = useState<LoginMutation>({
        phone: '',
        password: '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        loginMutation.mutate(form, {
            onSuccess: (data) => {
                router.push(roleDashboardPaths[data.user.role]);
            },
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F8F4] px-4">
            <form
                onSubmit={onSubmit}
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
                    <input
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#39C6C5]"
                        placeholder="Телефон"
                        value={form.phone}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                phone: e.target.value,
                            })
                        }
                    />

                    <input
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#39C6C5]"
                        type="password"
                        placeholder="Пароль"
                        value={form.password}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                password: e.target.value,
                            })
                        }
                    />

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