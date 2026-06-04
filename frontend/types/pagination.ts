

export interface PaginationType {
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}