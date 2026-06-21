export interface Faq {
  _id: string;
  question: string;
  answer: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqMutation {
  question: string;
  answer: string;
  isPublished?: boolean;
}

export interface ReorderMutation {
  ids: string[];
}

export interface FaqResponse {
  message: string;
  faq: Faq;
}