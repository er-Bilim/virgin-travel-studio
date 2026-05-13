import {Document, Types} from 'mongoose';

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'CONTRACT_PENDING' | 'COMPLETED' | 'REJECTED';

export interface IOrder extends Document {
  tourSetId: Types.ObjectId;
  clientName: string;
  clientPhone: string;
  status: OrderStatus;
  rejectionReason: string | null;
  managerId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}