import {
    FolderOpen,
    LayoutDashboard,
    type LucideIcon,
    Newspaper,
    Plane,
    Tags,
    Users
} from 'lucide-react';

import type {UserRole} from '@/types/user';

export const apiURL = process.env.NEXT_API_URL || 'http://localhost:8000/api';
export const imageUrl = process.env.NEXT_IMAGE_URL || 'http://localhost:8000/';

export enum OrderStatus {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    CONTRACT_PENDING = 'CONTRACT_PENDING',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED'
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: 'Новый',
  [OrderStatus.IN_PROGRESS]: 'В работе',
  [OrderStatus.CONTRACT_PENDING]: 'Ожидает договора',
  [OrderStatus.COMPLETED]: 'Завершён',
  [OrderStatus.REJECTED]: 'Отклонён',
};

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
    label: 'Заявки',
    href: '/admin/leads',
    roles: ['ADMIN'],
    icon: FolderOpen,
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

export const theme = {
    bg: "#E9F0FA",
    border: "#CBD9EE",

    cyan: "#3FE6FF",
    cyanHover: "#2fd6ef",

    overlay: "rgba(0,0,0,0.4)",

    shadow: "rgba(0,0,0,0.06)",
    glow: "rgba(63,230,255,0.12)",

    dark: "#031633",
};

export const itemsNavHeader = [
    {
        id: "tours",
        label: "Туры",
        image:
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    },
    {
        id: "dest",
        label: "Направления",
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    },
    {
        id: "about",
        label: "О нас",
        image:
            "https://images.unsplash.com/photo-1526779259212-939e64788e3c",
    },
    {
        id: "contacts",
        label: "Контакты",
        image:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    },
];