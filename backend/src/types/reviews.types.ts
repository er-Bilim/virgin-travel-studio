import mongoose from 'mongoose';

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

export interface ReviewDocument extends ReviewFields, mongoose.Document {}
