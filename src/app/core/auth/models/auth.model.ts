export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    email: string;
    fullName: string;
    isActive:boolean;
    expiresAt: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    FullName? : string;
}

export interface RegisterResponse {
    token: string;
    email: string;
    isActive:boolean;
    fullName: string;
    expiresAt: string;
}

export interface User {
    email: string;
    fullName: string;
    isActive:boolean;
}

