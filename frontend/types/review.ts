export interface IReviewMutation {
  rating: number;
  clientName: string;
  comment: string;
  image?: File | null;
}

export interface IReview {
  rating: number;
  comment: string;
  image: string;
  createdDate: string;
  updatedDate: string;
}
