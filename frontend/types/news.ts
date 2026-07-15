import type {MetaType} from "@/types/meta";

export type NewsFields = {
  _id: string;
  title: string;
  content: string;
  image: string | null;
  tags: string[];
  isPublished: boolean;
  author: {
    fullName: string;
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type NewsMutation = {
  title: string;
  content: string;
  image?: File | null;
  tags: string[];
}

export type INews = Omit<NewsFields, 'isPublished'>

export type NewsData = {
  allNews: NewsFields[];
  metadata: MetaType
}

export interface GetNewsParams {
  page: number;
  limit: number;
  searchText?: string;
  isPublished?: string;
  authorId?: string;
  tags?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface NewsTag {
  tag: string
}