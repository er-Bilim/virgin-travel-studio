'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { LogOut } from 'lucide-react';

import { dashboardMenuItems, roleDashboardPaths } from '@/lib/constants';
import { useLogout, useUser } from '@/lib/hooks';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const { data: user } = useUser();
    const logoutMutation = useLogout();

    if (!user) return null;

    const filteredItems = dashboardMenuItems.filter((item) =>
        item.roles.includes(user.role),
    );

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } finally {
            router.push('/login');
        }
    };

    return (
        <aside className="hidden w-72 border-r border-gray-200 bg-white lg:flex lg:flex-col">
            <div className="border-b border-gray-200 px-6 py-5">
                <Link href={roleDashboardPaths[user.role]} className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E2B6D] text-xl font-bold text-white">
                        V
                    </div>

                    <div>
                        <h1 className="text-lg font-bold text-[#1E2B6D]">
                            Virgin Travel
                        </h1>

                        <p className="text-sm text-gray-500">
                            Studio Dashboard
                        </p>
                    </div>
                </Link>
            </div>

            <div className="flex flex-1 flex-col justify-between">
                <nav className="flex flex-col gap-2 p-4">
                    {filteredItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                    pathname === item.href
                                        ? 'bg-[#1E2B6D] text-white shadow-md'
                                        : 'text-[#1E2B6D] hover:bg-[#F3F4F6]',
                                )}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-gray-200 p-4">
                    <div className="mb-4 rounded-2xl bg-[#F8FAFC] p-4">
                        <p className="text-sm font-semibold text-[#1E2B6D]">
                            {user.fullName}
                        </p>

                        <p className="text-xs font-medium uppercase tracking-wide text-[#39C6C5]">
                            {user.role}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
                    >
                        <LogOut size={18} />
                        {logoutMutation.isPending ? 'Выход...' : 'Выйти'}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;