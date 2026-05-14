import axiosApi from "@/lib/axiosApi";
import { OrderType } from "@/types/order";


export const postOrder = async (data: OrderType) => {
    const result = await axiosApi.post('/orders/', data);
    return result.data;
}