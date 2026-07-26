import type{IOrder} from "@/types/orders.types.js";
import type{TourSetFields} from "@/types/tourSets.types.js";
import type {UserFields} from "@/types/users.types.js";

export type PopulatedOrder = Omit<IOrder, 'tourSetId' | 'managerId'> & {
    tourSetId: Omit<TourSetFields, 'tourId'> & {
        tourId: {
            _id: string;
            title: string;
        };
    };
    managerId: UserFields;
};
