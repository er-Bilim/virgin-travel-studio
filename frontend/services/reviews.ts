import axiosApi from '@/lib/axiosApi';
import {createFormData} from '@/lib/utils';
import type {
  IPaginationReviews,
  IReview,
  IReviewMutation,
  IReviewParams,
} from '@/types/review';
import {toast} from 'sonner';

export const getPublicReviews = async (
  params: IReviewParams,
): Promise<IPaginationReviews> => {
  try {
    const {data} = await axiosApi.get<IPaginationReviews>('/reviews/public', {
      params,
    });

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAdminReviews = async (
  params: { tourId?: string; page?: number; limit?: number;isModerated?: string },
): Promise<IPaginationReviews> => {
  try {
    const {data} = await axiosApi.get<IPaginationReviews>('/reviews/admin', {
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

    const {data: responseData} = await axiosApi.post<{
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

export const updateReview = async (
  id: string,
  data: Partial<IReviewMutation>,
) => {
  try {
    const formData = createFormData(data);

    const {data: responseData} = await axiosApi.patch<{
      message: string;
      review: IReview;
    }>(`/reviews/${id}`, formData);

    toast.success(responseData.message);
    return responseData.review;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteReview = async (id: string) => {
  try {
    const {data} = await axiosApi.delete<{ message: string }>(
      `/reviews/${id}`,
    );

    toast.success(data.message);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const approveReview = async (id: string, isModerated: "pending" | "approved" | "rejected") => {
  try {
    const {data} = await axiosApi.patch<{
      message: string;
      review: IReview;
    }>(
      `/reviews/${id}/approve`,
      {isModerated  }
    );

    toast.success(data.message);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}