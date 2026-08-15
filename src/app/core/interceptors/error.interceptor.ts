import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        messageService.add({
          severity: 'warn',
          summary: 'Sesion expirada',
          detail: 'Vuelve a iniciar sesión',
        });
        authStore.logout();
      }
      return throwError(() => error);
    }),
  );
};
