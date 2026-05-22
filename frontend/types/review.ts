export interface IReviewMutation {
  rating: number;
  clientName: string;
  comment: string;
  image?: File | null;
}

export interface IReview {
  _id: string;
  clientName: string;
  rating: number;
  comment: string;
  image: string | null;
  createdDate: string;
  updatedDate: string;
}
