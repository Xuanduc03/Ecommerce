export interface User {
    _id: string;
    fullname: string;
    email: string;
    phone: string;
    address: string;
    role: string; // 'admin' | 'user'
    createAt: string; // ISO date string
    updateAt?: string; // ISO date string, optional
    isActive?: boolean; // optional field to indicate if the user is active
}