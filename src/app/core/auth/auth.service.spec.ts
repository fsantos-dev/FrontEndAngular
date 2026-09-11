import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { AuthService } from './auth.service';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from './models/auth.model';
import { APP_CONFIG } from '../config/app.config';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should login with the provided credentials', () => {
    const credentials: LoginRequest = {
      email: 'test@email.com',
      password: 'Password123!',
    };

    const response: LoginResponse = {
      token: 'fake-token',
      email: 'test@email.com',
      fullName: 'Test User',
      isActive: true,
      expiresAt: '2026-12-31T23:59:59Z',
    };

    service.login(credentials).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(`${APP_CONFIG.apiUrl}/auth/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);

    request.flush(response);
  });

  it('should register with the provided user data', () => {
    const userData: RegisterRequest = {
      email: 'test@email.com',
      password: 'Password123!',
    };

    const response: RegisterResponse = {
      token: 'fake-token',
      email: 'test@email.com',
      isActive: true,
      fullName: 'Test User',
      expiresAt: '2026-12-31T23:59:59Z',
    };

    service.register(userData).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(`${APP_CONFIG.apiUrl}/auth/register`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(userData);

    request.flush(response);
  });
});
