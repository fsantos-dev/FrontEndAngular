export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    email: string;
    fullName: string;
    expiresAt: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    FullName? : string;
}

export interface RegisterResponse {
    id: number;
    email: string;
    fullName: string;
    createdAt: string:
}