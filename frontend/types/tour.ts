import type { MetaType } from "./meta";

export interface TourCategoryType {
  _id: string;
  title: string;
  isPublished: boolean;
}

export type TourCategory = Omit<TourCategoryType, 'isPublished'>

export interface ToursGetResponse {
  tours: TourType[];
  meta: MetaType;
}

export interface TourType {
  _id: string;
  tourSetID: string;
  title: string;
  description: string;
  images: string[];
  category: TourCategoryType;
  baseAdvantages: string[];
  rating: number;
  ratingCount: number;
  isPublished: boolean;
  isHot: boolean;
  minPrice: number;
  hotelLocation: string;
  nextStartDate: string;
  durationDays: number;
}

export interface TourMutation {
  title: string;
  description: string;
  category: string;
  baseAdvantages: string[];
  images: File[];
}

export interface GetToursParams {
  page: number,
  limit: number,
  categoryId?: string | null,
  search?: string,
  isPublished?: boolean,
  sort?: string | null;
}