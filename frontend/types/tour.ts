// tour.types.ts
import type { MetaType } from "./meta";

export interface TourCategoryType {
  title: string;
}

export interface ToursGetResponse {
  tours: TourType[];
  meta: MetaType
}

export interface TourType {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: TourCategoryType;
  baseAdvantages: string[];
  isPublished: boolean;
}