import type { MetaType } from "./meta";
import type { TourType } from "./tour";

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