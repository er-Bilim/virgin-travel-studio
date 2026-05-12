// tour.types.ts

export interface TourCategoryType {
  title: string;
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