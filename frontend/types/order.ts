// order.types.ts

interface CategoryLite {
  _id: string;
  title: string
}

interface TourLite {
  _id: string;
  title: string;
  category: CategoryLite;
}

interface ManagerLite {
  _id: string;
  fullName: string;
  phone: number
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
  }
}

export interface OrderStats {
  byStatus: {
    NEW: number;
    IN_PROGRESS: number;
    CONTRACT_PENDING: number;
    COMPLETED: number;
    REJECTED: number;
  },
  completedToday: number;
  monthRevenue: number;
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
    tourSetId: string;
    clientPhone: string;
    clientName: string;
}

export interface ContractFormValues {
  passportNumber: string;
  passportIssuedBy: string;
  passportIssueDate: string;
  birthDate: string;
}