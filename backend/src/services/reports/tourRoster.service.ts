import Order from "@/model/order/Order.js";
import type {PopulatedOrder} from "@/types/reports.types.js";


export const getTourRosterData = async (tourSetId: string) => {
    const orders = await Order.find({ tourSetId, status: "COMPLETED" })
        .populate({
            path: 'tourSetId',
            populate: {
                path: 'tourId',
            },
        })
        .populate('managerId')
        .lean() as unknown as PopulatedOrder[];

    const formatDate = (date: Date) => {
        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}.${month}.${year}`;
    };

    return  orders.map(order => ({
        clientName: order.clientName,
        clientPhone: order.clientPhone,
        status: order.status,

        tour: order.tourSetId?.tourId?.title ?? '',
        dates: order.tourSetId?.startDate && order.tourSetId?.endDate
            ? `${formatDate(order.tourSetId.startDate)} - ${formatDate(order.tourSetId.endDate)}`
            : '',
        hotel: order.tourSetId?.hotelName ?? '',

        manager: order.managerId?.fullName ?? '',
        sum: order.tourSetId?.price ?? 0,
    }));
};

