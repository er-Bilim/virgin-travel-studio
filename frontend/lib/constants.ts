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

export const apiURL = 'http://localhost:8000/api';

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