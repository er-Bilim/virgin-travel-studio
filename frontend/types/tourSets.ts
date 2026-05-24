import type { MetaType } from './meta';
import type { TourType } from './tour';

export interface TourSetType {
  _id: string;
  tourId: TourType;
  startDate: string;
  endDate: string;
  price: number;
  hotelName: string;
  hotelLocation: string;
  airline: string;
  flightDetails: string;
  totalSeats: number;
  bookedSeats: number;
  isHot: boolean;
  saleDeadline: string;
  discountPrice?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TourSetsGetType {
  tourSets: TourSetType[];
  meta: MetaType;
}

export type TourSetStatus = 'OPEN' | 'CLOSED' | 'FINISHED';

export interface TourSetMutation {
  tourId: string;
  startDate: string;
  endDate: string;
  price: number;
  discountPrice?: number;
  hotelName: string;
  hotelLocation: string;
  airline?: string;
  flightDetails?: string;
  totalSeats: number;
  isHot: boolean;
  saleDeadline?: string;
  status?: TourSetStatus;
}

export interface TourSetsFilters {
  page: number;
  limit: number;
  tourId: string;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
}