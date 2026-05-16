import mongoose, {Schema, Types} from 'mongoose';
import {IOrder} from '@/types/orders.types.js';

const OrderSchema = new Schema({
    tourSetId: {
        type: Types.ObjectId,
        ref: "TourSet",
        required: [true, 'ID тура обязателен'],
    },
    clientName: {
        type: String,
        required: [true, 'Имя клиента обязательно'],
        trim: true,
    },
    clientPhone: {
        type: String,
        required: [true, 'Номер телефона обязателен'],
        trim: true,
        match: [/^\+?[0-9]{7,15}$/, 'Пожалуйста, введите корректный номер телефона']
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['NEW', 'IN_PROGRESS', 'CONTRACT_PENDING', 'COMPLETED', 'REJECTED'],
            message: 'Недопустимый статус'
        },
        default: 'NEW',
    },
    rejectionReason: {
        type: String,
        trim: true,
        minLength: [3, 'Причина отказа должна быть не менее 3 символов'],
        validate: {
            validator: function (this: IOrder, value: string | null) {
                if (this.status === 'REJECTED') {
                    return value !== null && value.trim().length > 0;
                }
                return true;
            },
            message: 'Причина отказа обязательна, если установлен статус REJECTED'
        }
    },
    managerId: {
        type: Types.ObjectId,
        ref: "User",
    },
    },
     {
        timestamps: true,
     }
);




const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;