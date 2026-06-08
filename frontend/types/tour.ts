import type {MetaType} from './meta';
import type {TourSetType} from './tourSets';

export interface TourCategoryType {
  _id: string;
  title: string;
  isPublished: boolean;
}

export interface CategoryTypeResponse {
  categories: TourCategoryType[];
  meta: MetaType;
}


export type TourCategory = Omit<TourCategoryType, 'isPublished'>

export interface ToursGetResponse {
  tours: ITourWithTourSetFields[];
  meta: MetaType;
}

export interface TourType {
  _id: string;
  title: string;
  countryCode: string;
  description: string;
  images: string[];
  category: TourCategoryType;
  baseAdvantages: string[];
  rating: number;
  ratingCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface ITourWithTourSetFields extends TourType {
  isHot: boolean;
  minPrice: number;
  hotelLocation: string;
  nextStartDate: string;
  durationDays: number;
} 

export interface ISingleTour extends TourType {
  tourSets: TourSetType[]
}

export interface TourMutation {
  title: string;
  description: string;
  category: string;
  baseAdvantages: string[];
  images: File[];
}

export interface GetToursParams {
  page?: number,
  limit: number,
  categoryId?: string | null,
  search?: string,
  isPublished?: string | boolean,
  countryCode?: string | null,
  sort?: string | null;
}