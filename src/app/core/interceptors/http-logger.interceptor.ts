// core/interceptors/http-logger.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';

export const httpLoggerInterceptor: HttpInterceptorFn = (req, next) => {
  
  if (!APP_CONFIG.enableLogging) {
    return next(req);
  }

  const startTime = performance.now();

  logRequest(req);

  return next(req).pipe(
    tap((event) => {
      if (event.type === 4 /* HttpEventType.Response */) {
        logResponse(req, event, startTime);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      logResponse(req, error, startTime, true);
      return throwError(() => error);
    }),
  );
};

function logRequest(req: { method: string; urlWithParams: string; body: unknown }): void {
  console.log(
    `%c=== REQUEST ▶ ${req.method} ${req.urlWithParams} ===`,
    'color: #2563eb; font-weight: bold;',
  );
  if (req.body) {
    console.table(req.body);
  }
}

function logResponse(
  req: { method: string; urlWithParams: string },
  event: { status?: number; body?: unknown } | HttpErrorResponse,
  startTime: number,
  isError = false,
): void {
  const duration = Math.round(performance.now() - startTime);
  const status = event.status ?? 0;
  const color = isError ? '#dc2626' : '#16a34a';

  console.log(
    `%c=== RESPONSE ◀ ${req.method} ${req.urlWithParams} [${status}] (${duration}ms) ===`,
    `color: ${color}; font-weight: bold;`,
  );

  const body = isError ? (event as HttpErrorResponse).error : (event as { body?: unknown }).body;
  if (body && typeof body === 'object') {
    console.table(body);
  } else if (body) {
    console.log(body);
  }
}
