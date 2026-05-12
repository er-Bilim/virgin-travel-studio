// user.types.ts// user.types.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'CLIENT';

export interface IUser {
    _id: string;
    fullName: string;
    phone: string;
    status: 'active' | 'banned';
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface ManagerMutation {
    fullName: string;
    phone: string;
    password: string;
}

export interface LoginMutation {
    phone: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    user: IUser;
}