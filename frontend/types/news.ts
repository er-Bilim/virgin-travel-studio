export type NewsFields = {
  title?: string;
  content?: string;
  image?: string | null;
  tags?: string[];
  isPublished?: boolean;
  author?: string;
}

export type NewsMutation = {
  title?: string;
  content?: string;
  image?: File | null;
  tags?: string[];
}