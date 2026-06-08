import type { Document, Types } from "mongoose";
import type { TourSetFields } from "./tourSets.types.js";
import type { ICategory } from "./category.types.js";

export interface ITour extends Document {
  title: string;
  description: string;
  images: string[];
  category: Types.ObjectId;
  baseAdvantages: string[];
  isPublished: boolean;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AggregatedTour = Omit<ITour, 'category'> & {
  category: ICategory;
  tourSets: TourSetFields[];
}

export interface AggregatedTours extends ITour{
  isHot: boolean;
  minPrice: number;
  hotelLocation: string;
  durationDays: number;
  nextStartDays: string;
}