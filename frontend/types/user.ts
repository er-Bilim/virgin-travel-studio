// user.types.ts
export interface IUser {
    _id: string;
    fullName: string;
    phone: string;

    status: "active" | "banned";

    role: "ADMIN" | "MANAGER" | "CLIENT";

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
    user: {
        _id: string;
        fullName: string;
        phone: string;
        role: "ADMIN" | "MANAGER" | "CLIENT";
        status: string;
    };
}