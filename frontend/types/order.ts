interface CategoryLite {
  _id: string;
  title: string;
}

interface TourLite {
  _id: string;
  title: string;
  category: CategoryLite;
}

interface ManagerLite {
  _id: string;
  fullName: string;
  phone: number;
}

interface ToursetLite {
  _id: string;
  startDate: string;
  endDate: string;
  price: number;
  hotelName: string;
  tourId: TourLite;
  bookedSeats: number;
  totalSeats: number;
}

export interface OrderType {
  _id: string;
  tourSetId: ToursetLite;
  clientPhone: string;
  clientName: string;
  status: string;
  rejectionReason: string | null;
  managerId: ManagerLite | null;
  visibleId: string;
  createdAt: string;
}

export interface PaginatedOrdersResponse {
  orders: OrderType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderMutationType {
  tourSetId?: string;
  clientPhone?: string;
  clientName?: string;
  status?: string;
  rejectionReason?: string | null;
  managerId: string | null | undefined;
}

export interface OrderPostType {
  tourSetId?: string;
  clientPhone: string;
  clientName: string;
}

export interface CustomTourMutation {
  countryCode: string;
  startDate: string;
  endDate: string;
  hotel?: string;
  description?: string | null;
  clientName: string;
  clientPhone: string;
}

type CustomTourType = Omit<CustomTourMutation, 'clientName' | 'clientPhone'> & {
  activities: string[];
};

export interface CustomTourPost {
  clientName: string;
  clientPhone: string;
  customTour: CustomTourType;
}

export interface ContractFormValues {
  passportNumber: string;
  passportIssuedBy: string;
  passportIssueDate: string;
  birthDate: string;
}

export type OrderStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'CONTRACT_PENDING'
  | 'COMPLETED'
  | 'REJECTED';

  export interface OrderStats {
    byStatus: {
      NEW: number;
      IN_PROGRESS: number;
      CONTRACT_PENDING: number;
      COMPLETED: number;
      REJECTED: number;
    };
    completedToday: number;
    monthRevenue: number;
  }