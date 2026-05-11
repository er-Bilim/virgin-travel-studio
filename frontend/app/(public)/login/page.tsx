"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { LoginMutation } from "@/types/user";
import { useLogin } from "@/lib/hooks";

export default function LoginPage() {
    const router = useRouter();
    const { mutate, isPending, error } = useLogin();

    const [form, setForm] = useState<LoginMutation>({
        phone: "",
        password: "",
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        mutate(form, {
            onSuccess: (data) => {
                const role = data.user.role;

                if (role === "ADMIN") {
                    router.push("/admin");
                    return;
                }

                if (role === "MANAGER") {
                    router.push("/manager");
                    return;
                }

                router.push("/");
            },
        });
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form onSubmit={onSubmit} className="space-y-3 w-80">

                <input
                    className="border p-2 w-full"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                    }
                />

                <input
                    className="border p-2 w-full"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button
                    className="bg-black text-white w-full p-2 disabled:opacity-50"
                    disabled={isPending}
                >
                    {isPending ? "Logging in..." : "Login"}
                </button>

                {error instanceof Error && (
                    <p className="text-red-500 text-sm">
                        {error.message}
                    </p>
                )}

            </form>
        </div>
    );
}