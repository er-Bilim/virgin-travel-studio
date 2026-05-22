import mongoose, { type HydratedDocument } from 'mongoose';

export interface ReviewFields {
  clientName: string;
  tourId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  image?: string | null;
  isModerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = HydratedDocument<ReviewFields>;
