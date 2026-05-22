import type { MetaType } from "./meta";

export interface TourCategoryType {
  _id: string;
  title: string;
  isPublished: boolean;
}

export interface ToursGetResponse {
  tours: TourType[];
  meta: MetaType;
}

export interface TourType {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: TourCategoryType;
  baseAdvantages: string[];
  rating: number;
  ratingCount: number;
  isPublished: boolean;
}

export interface TourMutation {
  title: string;
  description: string;
  category: string;
  baseAdvantages: string[];
  images: File[];
}
