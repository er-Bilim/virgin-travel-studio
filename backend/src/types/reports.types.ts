import {IOrder} from "@/types/orders.types.js";
import {TourSetFields} from "@/types/tourSets.types.js";
import {UserFields} from "@/types/users.types.js";

export type TourRosterItem = {
    clientName: string;
    clientPhone: string;
    tour: string;
    status: string;
    dates: string;
    hotel: string;
    manager: string;
    sum: number;
};

export type PopulatedOrder = Omit<IOrder, 'tourSetId' | 'managerId'> & {
    tourSetId: Omit<TourSetFields, 'tourId'> & {
        tourId: {
            _id: string;
            title: string;
        };
    };
    managerId: UserFields;
};

export type GetParams = {
    from?: string;
    to?: string;
    managerId?: string;
};

export type DailyManagerRow = {
    manager: string;
    newOrders: number;
    inProgress: number;
    completed: number;
    rejected: number;
    revenue: number;
};