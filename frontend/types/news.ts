export type NewsFields = {
  _id: string;
  title: string;
  content: string;
  image: string | null;
  tags: string[];
  isPublished: boolean;
  author: {
    fullName: string;
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