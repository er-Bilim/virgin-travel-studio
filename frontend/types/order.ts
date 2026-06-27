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

export type OrderStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'CONTRACT_PENDING'
  | 'COMPLETED'
  | 'REJECTED';


export type OrderPayment =
  | 'CASH'
  | 'CARD'
  | 'QR'
  | 'BANK';

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
}

export interface OrderType {
  _id: string;
  tourSetId: ToursetLite;
  clientPhone: string;
  clientName: string;
  status: string;
  rejectionReason: string | null;
  managerId: ManagerLite | null;
  paymentMethod?: OrderPayment;
  paymentAmount?: number;
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
  paymentMethod?: OrderPayment;
  paymentAmount?: number;
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