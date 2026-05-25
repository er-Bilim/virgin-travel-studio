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
}

export interface OrderType {
  _id: string;
  tourSetId: ToursetLite;
  clientPhone: string;
  clientName: string;
  status: string;
  rejectionReason: string | null;
  managerId: ManagerLite | null;
}

export interface PaginatedOrdersResponse {
  orders: OrderType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
  }
}

export interface OrderMutationType {
  tourSetId: string;
  clientPhone: string;
  clientName: string;
  status: string;
  rejectionReason: string | null;
  managerId: string | null | undefined;
} 


export interface OrderPostType {
    tourSetId: string;
    clientPhone: string;
    clientName: string;
} 