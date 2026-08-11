import { DestroyRef, Injectable, Signal, computed, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { LoginRequest, LoginResponse, RegisterRequest, User } from './models/auth.model';
import { UserService } from './user.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  private readonly tokenService = inject(TokenService);
  private readonly userService = inject(UserService);

  private readonly userSignal = signal<User | null>(this.userService.get());
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.tokenService.get() && !!this.user());

  private saveSession(response: LoginResponse): void {
    const user: User = {
      email: response.email,
      fullName: response.fullName,
      isActive: response.isActive,
    };

    this.tokenService.set(response.token);
    this.userService.set(user);
    this.userSignal.set(user);
  }

  login(credentials: LoginRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authService
      .login(credentials)
      .pipe(
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.saveSession(response);
          this.router.navigate(['/categorias']);
        },
        error: (err: HttpErrorResponse) => {
          this.errorSignal.set(this.extractError(err, 'Error al iniciar sesión'));
        },
      });
  }

  register(userData: RegisterRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.authService
      .register(userData)
      .pipe(
        finalize(() => this.loadingSignal.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.saveSession(response);
        },
        error: (err: HttpErrorResponse) => {
          this.errorSignal.set(this.extractError(err, 'Error al registrarse'));
        },
      });
  }

  logout(): void {
    this.tokenService.clear();
    this.router.navigate(['/auth/login']);
  }

  private extractError(err: HttpErrorResponse, fallback: string): string {
    return err?.error?.detail ?? fallback;
  }
}
