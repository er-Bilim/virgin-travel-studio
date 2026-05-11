'use client';

import { Menu } from 'lucide-react';

import { useUser } from '@/lib/hooks';

type Props = {
    onMenuClick: () => void;
};

const MobileTopbar = ({ onMenuClick }: Props) => {
    const { data: user } = useUser();

    return (
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 lg:hidden">
            <div>
                <p className="text-sm font-semibold text-[#1E2B6D]">
                    Virgin Travel Studio
                </p>

                <p className="text-xs text-gray-500">
                    {user ? `${user.fullName} · ${user.role}` : 'Dashboard'}
                </p>
            </div>

            <button
                type="button"
                aria-label="Открыть меню"
                onClick={onMenuClick}
                className="rounded-xl border border-gray-200 p-2 text-[#1E2B6D] transition hover:bg-gray-100"
            >
                <Menu size={22} />
            </button>
        </header>
    );
};

export default MobileTopbar;