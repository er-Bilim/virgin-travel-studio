// tour.types.ts

export interface TourType {
  _id: string;
  title: string;
  description: string; 
  images: string[];
  category: string;
  baseAdvantages: string[];
  isPublished: boolean
}