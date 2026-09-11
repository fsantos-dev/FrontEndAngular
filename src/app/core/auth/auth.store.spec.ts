import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { AuthStore } from './auth.store';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { InactivityService } from '../inactivity/inactivity.service';

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from './models/auth.model';

import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

describe('AuthStore', () => {
  let store: AuthStore;

  let authService: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
  };

  let tokenService: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  let userService: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  let inactivityService: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let messageService: {
    add: ReturnType<typeof vi.fn>;
  };

  const user: User = {
    email: 'test@email.com',
    fullName: 'Test User',
    isActive: true,
  };

  const token = 'fake-token';

  const loginCredentials: LoginRequest = {
    email: 'test@email.com',
    password: 'Password123!',
  };

  const registerData: RegisterRequest = {
    email: 'test@email.com',
    password: 'Password123!',
    FullName: 'Test User',
  };

  const loginResponse: LoginResponse = {
    token,
    email: 'test@email.com',
    fullName: 'Test User',
    isActive: true,
    expiresAt: '2026-12-31T23:59:59Z',
  };

  const registerResponse: RegisterResponse = {
    token,
    email: 'test@email.com',
    fullName: 'Test User',
    isActive: true,
    expiresAt: '2026-12-31T23:59:59Z',
  };

  beforeEach(() => {
    authService = {
      login: vi.fn(),
      register: vi.fn(),
    };

    tokenService = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      clear: vi.fn(),
    };

    userService = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      clear: vi.fn(),
    };

    inactivityService = {
      start: vi.fn(),
      stop: vi.fn(),
    };

    router = {
      navigate: vi.fn(),
    };

    messageService = {
      add: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: InactivityService,
          useValue: inactivityService,
        },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: MessageService,
          useValue: messageService,
        },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  it('should login successfully and save the session', () => {
    authService.login.mockReturnValue(of(loginResponse));

    store.login(loginCredentials);

    expect(tokenService.set).toHaveBeenCalledWith(token);

    expect(userService.set).toHaveBeenCalledWith(user);

    expect(router.navigate).toHaveBeenCalledWith(['/categories']);

    expect(inactivityService.start).toHaveBeenCalled();

    expect(store.user()).toEqual(user);
    expect(store.loading()).toBe(false);
    expect(store.isAuthenticated()).toBe(true);
  });

  it('should show an error message when login fails', () => {
    const error = new HttpErrorResponse({
      status: 401,
      error: {
        detail: 'Credenciales incorrectas',
      },
    });

    authService.login.mockReturnValue(
      throwError(() => error),
    );

    store.login(loginCredentials);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Credenciales incorrectas',
    });

    expect(store.loading()).toBe(false);
    expect(store.isAuthenticated()).toBe(false);
  });

  it('should use the fallback message when login error has no detail', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: {},
    });

    authService.login.mockReturnValue(
      throwError(() => error),
    );

    store.login(loginCredentials);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al iniciar sesión',
    });
  });

  it('should register successfully and save the session', () => {
    authService.register.mockReturnValue(of(registerResponse));

    store.register(registerData);

    expect(tokenService.set).toHaveBeenCalledWith(token);

    expect(userService.set).toHaveBeenCalledWith(user);

    expect(router.navigate).toHaveBeenCalledWith(['/categories']);

    expect(inactivityService.start).toHaveBeenCalled();

    expect(store.user()).toEqual(user);
    expect(store.loading()).toBe(false);
    expect(store.isAuthenticated()).toBe(true);
  });

  it('should show an error message when register fails', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        detail: 'El correo ya está registrado',
      },
    });

    authService.register.mockReturnValue(
      throwError(() => error),
    );

    store.register(registerData);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'El correo ya está registrado',
    });

    expect(store.loading()).toBe(false);
    expect(store.isAuthenticated()).toBe(false);
  });

  it('should use the fallback message when register error has no detail', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: {},
    });

    authService.register.mockReturnValue(
      throwError(() => error),
    );

    store.register(registerData);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al iniciar sesión',
    });
  });

  it('should logout and clear the session', () => {
    tokenService.get.mockReturnValue(token);
    userService.get.mockReturnValue(user);

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: InactivityService,
          useValue: inactivityService,
        },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: MessageService,
          useValue: messageService,
        },
      ],
    });

    store = TestBed.inject(AuthStore);

    store.logout();

    expect(inactivityService.stop).toHaveBeenCalled();
    expect(userService.clear).toHaveBeenCalled();
    expect(tokenService.clear).toHaveBeenCalled();

    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should initialize as authenticated when a token and user already exist', () => {
    tokenService.get.mockReturnValue(token);
    userService.get.mockReturnValue(user);

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: InactivityService,
          useValue: inactivityService,
        },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: MessageService,
          useValue: messageService,
        },
      ],
    });

    store = TestBed.inject(AuthStore);

    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
  });

  it('should initialize as unauthenticated without a token or user', () => {
    expect(store.user()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });
});