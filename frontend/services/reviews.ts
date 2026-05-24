import axiosApi from '@/lib/axiosApi';
import { createFormData } from '@/lib/utils';
import type { IPaginationReviews, IReview, IReviewMutation, IReviewParams } from '@/types/review';
import { toast } from 'sonner';



export const getReviews = async (params: IReviewParams): Promise<IPaginationReviews> => {
  try {
    const { data } = await axiosApi.get<IPaginationReviews>('/reviews/public', {
      params,
    });

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createReview = async (data: IReviewMutation) => {
  try {
    const formData = createFormData(data);
    const { data: responseData } = await axiosApi.post<{
      message: string;
      review: IReview;
    }>('/reviews', formData);
    toast.success(responseData.message);
    return responseData.review;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
