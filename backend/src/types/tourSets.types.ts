import { Types } from 'mongoose';

export type TourSetStatus = 'OPEN' | 'CLOSED' | 'FINISHED';

export interface TourSetFields {
  tourId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  price: number;
  hotelName: string;
  hotelLocation: string;
  airline?: string;
  flightDetails?: string;
  totalSeats: number;
  bookedSeats: number;
  isHot: boolean;
  saleDeadline?: Date;
  discountPrice?: number;
  status: TourSetStatus;
}
