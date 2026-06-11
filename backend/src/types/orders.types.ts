import { Document, Types } from 'mongoose';
import type { TourSetFields } from '@/types/tourSets.types.js';

export type OrderStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'CONTRACT_PENDING'
  | 'COMPLETED'
  | 'REJECTED';

export interface IOrder extends Document {
  type: 'STANDARD' | 'CUSTOM';
  tourSetId: Types.ObjectId;
  visibleId: string;
  clientName: string;
  clientPhone: string;
  status: OrderStatus;
  rejectionReason: string | null;
  managerId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  customTour?: {
    countryCode?: string;
    startDate?: Date;
    endDate?: Date;
    hotel?: string;
    description?: string;
    activities: string[];
  } | null;
}

export type PassportPayload = {
  passportNumber: string;
  passportIssuedBy: string;
  passportIssueDate: string;
  birthDate: string;
};

export type PopulatedOrder = Omit<IOrder, 'tourSetId' | 'managerId'> & {
  tourSetId: Omit<TourSetFields, 'tourId'> & {
    tourId: {
      _id: string;
      title: string;
    };
  };
  managerId: {
    _id: string;
    fullName: string;
    phone: string;
  };
};
