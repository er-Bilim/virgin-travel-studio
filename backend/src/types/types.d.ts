export interface UserFields {
    fullName: string;
    phone: string;
    password: string;
    status: "active" | "banned";
    role: "ADMIN" | "MANAGER" | "CLIENT";
    token: string;
}