import mongoose, { type HydratedDocument } from 'mongoose';

export interface ReviewFields {
  clientName: string;
  tourId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  image?: string | null;
  isModerated: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  companyReply?: string | null;
  featuredOnHomepage: boolean;
}

export type ReviewDocument = HydratedDocument<ReviewFields>;
