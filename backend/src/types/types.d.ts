export interface UserFields {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    role: "ADMIN" | "MANAGER" | "CLIENT";
    token: string;
}