import type { OrderStatus } from "@/types/order";

export const STEPS: string[] = ['Заявка', 'Подбор', 'Маршрут', 'Оплата', 'В путь'] as const;

export const statusToStep: Record<OrderStatus, number> = {
  NEW: 0,
  IN_PROGRESS: 1,
  CONTRACT_PENDING: 3,
  COMPLETED: 4,
  REJECTED: -1,
};