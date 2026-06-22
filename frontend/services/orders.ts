import axiosApi from '@/lib/axiosApi';
import type {
    ContractFormValues,
    OrderMutationType,
    OrderPostType,
    OrderStats,
    OrderType,
    PaginatedOrdersResponse
} from '@/types/order';

export const getOrders = async (
    filters: {
      managerId?: string,
      status?: string,
      page?: number,
      limit?: number,
    } = {}): Promise<PaginatedOrdersResponse> => {
  const result = await axiosApi.get<PaginatedOrdersResponse>('/orders', {
    params: filters,
  });
  return result.data;
}

export const getOrdersStats = async () => {
    const result = await axiosApi.get<OrderStats>('/orders/stats');
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

export const createContractOrder = async (id: string, data: ContractFormValues) => {
    const result = await axiosApi.post(`/orders/${id}/generate-contract`, data, {
        responseType: 'blob',
    });
    return result.data;
}