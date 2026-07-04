import type {TourType} from "@/types/tour";

export interface IReviewMutation {
  tourId?: string;
  rating: number;
  clientName: string;
  comment: string;
  image?: File | null;
  companyReply?: string | null;
}

export interface IReview {
  _id: string;
  clientName: string;
  rating: number;
  comment: string;
  image: string | null;
  createdDate: string;
  updatedDate: string;
  companyReply?: string | null;
  tourId: TourType;
  isModerated: "pending" | "approved" | "rejected";
  featuredOnHomepage: boolean;
}

export interface IPaginationReviews {
  reviews: IReview[]
  totalReviews: number;
  page: number;
  totalPage: number;
}

export interface IReviewParams {
  tourId?: string;
  limit: number;
  page: number;
}