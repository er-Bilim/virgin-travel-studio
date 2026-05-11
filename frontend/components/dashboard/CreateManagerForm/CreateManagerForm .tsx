"use client";

import { useState } from "react";

import type { ManagerMutation } from "@/types/user";
import { useCreateManager } from "@/lib/hooks";

export const CreateManagerForm = () => {
    const { mutate, isPending } = useCreateManager();

    const [form, setForm] = useState<ManagerMutation>({
        fullName: "",
        phone: "",
        password: "",
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        mutate(form, {
            onSuccess: () => {
                setForm({
                    fullName: "",
                    phone: "",
                    password: "",
                });
            },
        });
    };

    return (
        <form
            onSubmit={onSubmit}
            className="space-y-4 border p-6 rounded-xl"
            autoComplete="off"
        >
            <h2 className="text-xl font-semibold">
                Create Manager
            </h2>

            <div className="space-y-1">
                <label className="text-sm font-medium">
                    Full name
                </label>

                <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            fullName: e.target.value,
                        })
                    }
                    className="w-full border rounded-lg p-2"
                    placeholder="John Doe"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">
                    Phone
                </label>

                <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            phone: e.target.value,
                        })
                    }
                    className="w-full border rounded-lg p-2"
                    placeholder="+996700000000"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">
                    Password
                </label>

                <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            password: e.target.value,
                        })
                    }
                    className="w-full border rounded-lg p-2"
                    placeholder="******"
                />

            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
                {isPending ? "Creating..." : "Create manager"}
            </button>

        </form>
    );
};