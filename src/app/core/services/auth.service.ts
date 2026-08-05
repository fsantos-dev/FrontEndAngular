import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../../features/auth/models/auth.model";
import { APP_CONFIG } from "../config/app.config";
@Injectable({ providedIn: 'root'})
export class AuthService {
    private readonly http = inject(HttpClient);
    
    login(credentials : LoginRequest):Observable<LoginResponse>{
        return this.http.post<LoginResponse>(`${APP_CONFIG.apiUrl}/login`, credentials);
    }

    register(userData: RegisterRequest): Observable<LoginResponse>{
        return this.http.post<LoginResponse>(`${APP_CONFIG.apiUrl}/register`, userData);
    }
}