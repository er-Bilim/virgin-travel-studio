import axiosApi from '@/lib/axiosApi';
import type { OrderMutationType, OrderPostType, OrderType } from '@/types/order';

export const getOrders = async (
  managerId: string | undefined = undefined,
): Promise<OrderType[]> => {
  let url = '/orders/';

  if (managerId) url += `?managerId=${managerId}`
  const result = await axiosApi.get(url);
  return result.data;
};

export const getOneOrder = async (id: string): Promise<OrderType> => {
  const result = await axiosApi.get(`/orders/${id}`);
  return result.data;
};

export const postOrder = async (data: OrderPostType) => {
  const result = await axiosApi.post('/orders/', data);
  return result.data;
};

export const updateOrder = async (id: string, data: OrderMutationType) => {
  const result = await axiosApi.patch(`/orders/${id}`, data);
  return result.data;
};

export const deleteOrder = async (id: string) => {
  await axiosApi.delete(`/orders/${id}`);
};