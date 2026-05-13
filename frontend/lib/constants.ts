import {
    FolderOpen,
    LayoutDashboard,
    Newspaper,
    Plane,
    Tags,
    Users,
    type LucideIcon,
} from 'lucide-react';

import type { UserRole } from '@/types/user';

export const apiURL = process.env.NEXT_API_URL || 'http://localhost:8000/api';
export const imageUrl = process.env.NEXT_IMAGE_URL || 'http://localhost:8000/';

export type DashboardMenuItem = {
    label: string;
    href: string;
    roles: UserRole[];
    icon: LucideIcon;
};

export const dashboardMenuItems: DashboardMenuItem[] = [
    {
        label: 'Панель',
        href: '/admin/dashboard',
        roles: ['ADMIN'],
        icon: LayoutDashboard,
    },
    {
        label: 'Менеджеры',
        href: '/admin/managers',
        roles: ['ADMIN'],
        icon: Users,
    },
    {
        label: 'Новости',
        href: '/admin/news',
        roles: ['ADMIN'],
        icon: Newspaper,
    },
    {
        label: 'Туры',
        href: '/admin/tours',
        roles: ['ADMIN'],
        icon: Plane,
    },
    {
        label: 'Категории',
        href: '/admin/categories',
        roles: ['ADMIN'],
        icon: Tags,
    },
    {
        label: 'Панель',
        href: '/manager/dashboard',
        roles: ['MANAGER'],
        icon: LayoutDashboard,
    },
    {
        label: 'Новости',
        href: '/manager/news',
        roles: ['MANAGER'],
        icon: Newspaper,
    },
    {
        label: 'Туры',
        href: '/manager/tours',
        roles: ['MANAGER'],
        icon: Plane,
    },
    {
        label: 'Заявки',
        href: '/manager/leads',
        roles: ['MANAGER'],
        icon: FolderOpen,
    },
];

export const roleDashboardPaths: Record<UserRole, string> = {
    ADMIN: '/admin/dashboard',
    MANAGER: '/manager/dashboard',
    CLIENT: '/',
};

export const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition " +
    "focus-visible:border-[#1E2B6D] focus-visible:ring-2 focus-visible:ring-[#1E2B6D]/20";