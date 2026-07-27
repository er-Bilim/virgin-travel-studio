import {
  FileUser,
  CircleUser,
  FolderOpen,
  LayoutDashboard,
  type LucideIcon,
  Newspaper,
  Plane,
  Star,
  Tags,
  Users
} from 'lucide-react';

import type {UserRole} from '@/types/user';
import type {QueryClient} from '@tanstack/react-query';

export const isDev = process.env.NODE_ENV === 'development';

export const apiURL =
  typeof window !== 'undefined'
    ? '/api'
    : (process.env.NEXT_API_URL?.trim() || 'http://localhost:8000/api');

export const imageUrl = '/';
export const toursLimitPag = 9;


export const queryConfig = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
} satisfies ConstructorParameters<typeof QueryClient>[0];

export const REPORT_BUTTONS: string[] = ["Сегодня", "Неделя", "Месяц", "3 месяца"] as const;
export const IMAGE_UPLOAD = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['image/png', 'image/jpeg', 'image/webp'] as const,
  MAX_FILES: 5,
  COMPRESSION: {
    MAX_SIZE_MB: 1,
    MAX_WIDTH_OR_HEIGHT: 1600,
  },
} as const;

export enum UserStatus {
  BANNED = 'banned',
  ACTIVE = 'active',
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.BANNED]: 'Заблокирован',
  [UserStatus.ACTIVE]: 'Активен'
}

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'bg-green-100 text-green-700',
  [UserStatus.BANNED]: 'bg-red-100 text-red-700',
};

export enum OrderStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  CONTRACT_PENDING = 'CONTRACT_PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.IN_PROGRESS,
  OrderStatus.CONTRACT_PENDING,
  OrderStatus.COMPLETED,
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: 'Новый',
  [OrderStatus.IN_PROGRESS]: 'В работе',
  [OrderStatus.CONTRACT_PENDING]: 'Ожидает договора',
  [OrderStatus.COMPLETED]: 'Завершён',
  [OrderStatus.REJECTED]: 'Отклонён',
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.NEW]: 'bg-blue-100 text-blue-700',
  [OrderStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-700',
  [OrderStatus.CONTRACT_PENDING]: 'bg-purple-100 text-purple-700',
  [OrderStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [OrderStatus.REJECTED]: 'bg-red-100 text-red-700',
};

export enum TourSetStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FINISHED = 'FINISHED',
}

export const TOUR_SET_STATUS_LABELS: Record<TourSetStatus, string> = {
  [TourSetStatus.OPEN]: 'Открыт',
  [TourSetStatus.CLOSED]: 'Закрыт',
  [TourSetStatus.FINISHED]: 'Завершён',
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
    label: 'Отзывы',
    href: '/admin/reviews',
    roles: ['ADMIN'],
    icon: Star,
  },
  {
    label: 'Настройки',
    href: '/admin/settings',
    roles: ['ADMIN'],
    icon: FileUser,
  },
  {
    label: 'О нас',
    href: '/admin/aboutUs',
    roles: ['ADMIN'],
    icon: CircleUser,
  },
  {
    label: 'Панель',
    href: '/manager/dashboard',
    roles: ['MANAGER'],
    icon: LayoutDashboard,
  },
  {
    label: 'Заявки',
    href: '/manager/leads',
    roles: ['MANAGER'],
    icon: FolderOpen,
  }
];

export const roleDashboardPaths: Record<UserRole, string> = {
  ADMIN: '/admin/dashboard',
  MANAGER: '/manager/dashboard',
  CLIENT: '/',
};

export const inputClass =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition ' +
  'focus-visible:border-[#1E2B6D] focus-visible:ring-2 focus-visible:ring-[#1E2B6D]/20';

export const theme = {
  bg: '#E9F0FA',
  border: '#CBD9EE',

  cyan: '#3FE6FF',
  cyanHover: '#2fd6ef',

  overlay: 'rgba(0,0,0,0.4)',

  shadow: 'rgba(0,0,0,0.06)',
  glow: 'rgba(63,230,255,0.12)',

  dark: '#031633',
};

export const tableClassName = 'w-full table-fixed text-sm';

export const headerRowClassName =
  'bg-gray-50 text-gray-600 uppercase text-xs tracking-wider overflow-hidden';

export const rowClassName =
  'hover:bg-blue-50/40 transition-colors border-b border-gray-100 first:rounded-t-2xl last:rounded-b-2xl';

export const itemsNavHeader = [
  {
    id: 'tours',
    label: 'Туры',
  },
  {
    id: 'news',
    label: 'Новости',
  },
  {
    id: 'about',
    label: 'О нас',
  },
  {
    id: 'contacts',
    label: 'Контакты',
  },
];
